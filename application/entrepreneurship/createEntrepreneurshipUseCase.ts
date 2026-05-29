import type { EntrepreneurshipRepository } from "../ports/entrepreneurshipRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { EntrepreneurshipOutcome } from "../types/entrepreneurshipOutcome.js";
import { resolveFeaturedImageForUpload } from "../media/cloudinaryUploadSource.js";

export class CreateEntrepreneurshipUseCase {
  constructor(
    private readonly entrepreneurship: EntrepreneurshipRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  execute(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<EntrepreneurshipOutcome> {
    return this.createWithImage(data, userId, companyId);
  }

  private async createWithImage(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<EntrepreneurshipOutcome> {
    try {
      const payload = { ...data };
      const imageDecision = resolveFeaturedImageForUpload(payload.featuredImage);
      if (imageDecision.upload) {
        if (!this.mediaStorage) {
          return {
            status: 503,
            message:
              "Cloudinary no está configurado para imagen destacada de entrevista",
          };
        }
        const uploaded = await this.mediaStorage.upload({
          source: imageDecision.source,
          folder: "dragonrock/entrepreneurship",
          resourceType: "image",
        });
        payload.featuredImage = uploaded.secureUrl;
      } else if (imageDecision.value) {
        payload.featuredImage = imageDecision.value;
      } else {
        delete payload.featuredImage;
      }
      return await this.entrepreneurship.create(payload, userId, companyId);
    } catch (e: unknown) {
      console.log("[entrepreneurship] create", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
