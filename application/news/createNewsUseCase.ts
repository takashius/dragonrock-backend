import type { NewsRepository } from "../ports/newsRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { NewsOutcome } from "../types/newsOutcome.js";

export class CreateNewsUseCase {
  constructor(
    private readonly news: NewsRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  execute(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<NewsOutcome> {
    return this.createWithImage(data, userId, companyId);
  }

  private async createWithImage(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<NewsOutcome> {
    try {
      const payload = { ...data };
      const imageRaw = payload.image;
      if (typeof imageRaw === "string" && imageRaw.trim()) {
        if (!this.mediaStorage) {
          return {
            status: 503,
            message: "Cloudinary no está configurado para imagen de noticia",
          };
        }
        const uploaded = await this.mediaStorage.upload({
          source: imageRaw,
          folder: "dragonrock/news",
          resourceType: "image",
        });
        payload.image = uploaded.secureUrl;
      }
      return await this.news.create(payload, userId, companyId);
    } catch (e: unknown) {
      console.log("[news] create", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
