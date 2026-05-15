import type { NewsRepository } from "../ports/newsRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { NewsOutcome } from "../types/newsOutcome.js";

export class UpdateNewsUseCase {
  constructor(
    private readonly news: NewsRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  execute(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<NewsOutcome> {
    return this.updateWithImage(data, companyId, editorUserId);
  }

  private async updateWithImage(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<NewsOutcome> {
    try {
      const payload = { ...data };
      const imageRaw = payload.image;
      const shouldReplaceImage =
        typeof imageRaw === "string" && imageRaw.trim().length > 0;

      let previousImage: string | undefined;
      if (shouldReplaceImage) {
        if (!this.mediaStorage) {
          return {
            status: 503,
            message: "Cloudinary no está configurado para imagen de noticia",
          };
        }

        const existing = await this.news.getDetail(payload.id, companyId);
        if (
          existing.status === 200 &&
          existing.message &&
          typeof existing.message === "object" &&
          "image" in existing.message
        ) {
          const maybeImage = (existing.message as { image?: unknown }).image;
          if (typeof maybeImage === "string" && maybeImage.trim()) {
            previousImage = maybeImage;
          }
        }

        const uploaded = await this.mediaStorage.upload({
          source: imageRaw,
          folder: "dragonrock/news",
          resourceType: "image",
        });
        payload.image = uploaded.secureUrl;
      }

      const updated = await this.news.update(payload, companyId, editorUserId);

      if (
        updated.status === 200 &&
        shouldReplaceImage &&
        previousImage &&
        previousImage !== payload.image &&
        this.mediaStorage?.destroyByUrl
      ) {
        try {
          await this.mediaStorage.destroyByUrl(previousImage);
        } catch (cleanupError: unknown) {
          console.log("[news] no se pudo borrar imagen previa", cleanupError);
        }
      }

      return updated;
    } catch (e: unknown) {
      console.log("[news] update", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
