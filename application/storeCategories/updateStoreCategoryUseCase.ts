import type { StoreCategoryRepository } from "../ports/storeCategoryRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { StoreCategoryOutcome } from "../types/storeCategoryOutcome.js";
import {
  destroyUrlsBestEffort,
  resolveFeaturedImageField,
} from "../multimedia/uploadMultimediaImages.js";
import {
  asStoreCategoryDoc,
  stripStoreCategoryApiFields,
} from "./storeCategoryPayloadHelpers.js";

const COVER_FOLDER = "dragonrock/store/categories";

export class UpdateStoreCategoryUseCase {
  constructor(
    private readonly categories: StoreCategoryRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  execute(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<StoreCategoryOutcome> {
    return this.updateWithImage(data, companyId, editorUserId);
  }

  private async updateWithImage(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<StoreCategoryOutcome> {
    const urlsToDestroy: string[] = [];

    try {
      const existingOutcome = await this.categories.getDetail(
        data.id,
        companyId
      );
      if (existingOutcome.status !== 200) {
        return existingOutcome;
      }
      const existing = asStoreCategoryDoc(existingOutcome.message);
      if (!existing) {
        return { status: 400, message: "Category not found" };
      }

      const payload = { ...data };
      const previousCover = existing.featuredImage;

      if ("image" in payload) {
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
          if (
            previousCover &&
            previousCover !== coverResult.featuredImage
          ) {
            urlsToDestroy.push(previousCover);
          }
        } else if (coverResult.shouldSkip && payload.image === "") {
          payload.featuredImage = undefined;
          if (previousCover) {
            urlsToDestroy.push(previousCover);
          }
        }
      }

      stripStoreCategoryApiFields(payload);

      const updated = await this.categories.update(
        payload,
        companyId,
        editorUserId
      );

      if (updated.status === 200) {
        await destroyUrlsBestEffort(this.mediaStorage, urlsToDestroy);
      }

      return updated;
    } catch (e: unknown) {
      console.log("[storeCategories] update", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
