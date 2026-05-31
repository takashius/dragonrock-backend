import type { StoreCategoryRepository } from "../ports/storeCategoryRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { StoreCategoryOutcome } from "../types/storeCategoryOutcome.js";
import { resolveFeaturedImageField } from "../multimedia/uploadMultimediaImages.js";
import { stripStoreCategoryApiFields } from "./storeCategoryPayloadHelpers.js";

const COVER_FOLDER = "dragonrock/store/categories";

export class CreateStoreCategoryUseCase {
  constructor(
    private readonly categories: StoreCategoryRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  execute(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<StoreCategoryOutcome> {
    return this.createWithImage(data, userId, companyId);
  }

  private async createWithImage(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<StoreCategoryOutcome> {
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

      stripStoreCategoryApiFields(payload);

      return await this.categories.create(payload, userId, companyId);
    } catch (e: unknown) {
      console.log("[storeCategories] create", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
