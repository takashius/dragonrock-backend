import type { EntrepreneurshipRepository } from "../ports/entrepreneurshipRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { EntrepreneurshipOutcome } from "../types/entrepreneurshipOutcome.js";
import { resolveFeaturedImageForUpload } from "../media/cloudinaryUploadSource.js";

export class UpdateEntrepreneurshipUseCase {
  constructor(
    private readonly entrepreneurship: EntrepreneurshipRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  execute(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<EntrepreneurshipOutcome> {
    return this.updateWithImage(data, companyId, editorUserId);
  }

  private async updateWithImage(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<EntrepreneurshipOutcome> {
    try {
      const payload = { ...data };
      const imageDecision = resolveFeaturedImageForUpload(payload.featuredImage);
      let shouldReplaceImage = false;
      let previousImage: string | undefined;

      if (imageDecision.upload) {
        if (!this.mediaStorage) {
          return {
            status: 503,
            message:
              "Cloudinary no está configurado para imagen destacada de entrevista",
          };
        }

        const existing = await this.entrepreneurship.getDetail(
          payload.id,
          companyId
        );
        if (
          existing.status === 200 &&
          existing.message &&
          typeof existing.message === "object" &&
          "featuredImage" in existing.message
        ) {
          const maybeImage = (existing.message as { featuredImage?: unknown })
            .featuredImage;
          if (typeof maybeImage === "string" && maybeImage.trim()) {
            previousImage = maybeImage;
          }
        }

        const uploaded = await this.mediaStorage.upload({
          source: imageDecision.source,
          folder: "dragonrock/entrepreneurship",
          resourceType: "image",
        });
        payload.featuredImage = uploaded.secureUrl;
        shouldReplaceImage = true;
      } else if (imageDecision.value) {
        payload.featuredImage = imageDecision.value;
      } else if ("featuredImage" in payload) {
        delete payload.featuredImage;
      }

      const updated = await this.entrepreneurship.update(
        payload,
        companyId,
        editorUserId
      );

      if (
        updated.status === 200 &&
        shouldReplaceImage &&
        previousImage &&
        previousImage !== payload.featuredImage &&
        this.mediaStorage?.destroyByUrl
      ) {
        try {
          await this.mediaStorage.destroyByUrl(previousImage);
        } catch (cleanupError: unknown) {
          console.log(
            "[entrepreneurship] no se pudo borrar imagen previa",
            cleanupError
          );
        }
      }

      return updated;
    } catch (e: unknown) {
      console.log("[entrepreneurship] update", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
