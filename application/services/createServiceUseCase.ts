import type { ServiceRepository } from "../ports/serviceRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { ServiceOutcome } from "../types/serviceOutcome.js";
import { resolveFeaturedImageField } from "../multimedia/uploadMultimediaImages.js";
import { stripServiceApiFields } from "./servicePayloadHelpers.js";

const COVER_FOLDER = "dragonrock/services/cover";

export class CreateServiceUseCase {
  constructor(
    private readonly services: ServiceRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  execute(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<ServiceOutcome> {
    return this.createWithImage(data, userId, companyId);
  }

  private async createWithImage(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<ServiceOutcome> {
    try {
      const payload = { ...data };

      const coverResult = await resolveFeaturedImageField(
        payload.image,
        this.mediaStorage,
        COVER_FOLDER
      );
      if (!coverResult.ok) {
        return { status: coverResult.status, message: coverResult.message };
      }
      if (!coverResult.shouldSkip && coverResult.featuredImage) {
        payload.featuredImage = coverResult.featuredImage;
      }

      stripServiceApiFields(payload);

      return await this.services.create(payload, userId, companyId);
    } catch (e: unknown) {
      console.log("[services] create", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
