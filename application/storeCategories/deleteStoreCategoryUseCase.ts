import type { StoreCategoryRepository } from "../ports/storeCategoryRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { StoreCategoryOutcome } from "../types/storeCategoryOutcome.js";
import { destroyUrlsBestEffort } from "../multimedia/uploadMultimediaImages.js";

export class DeleteStoreCategoryUseCase {
  constructor(
    private readonly categories: StoreCategoryRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  async execute(id: string, companyId: string): Promise<StoreCategoryOutcome> {
    try {
      const outcome = await this.categories.softDelete(id, companyId);
      if (outcome.status !== 200) {
        return outcome;
      }

      const message = outcome.message;
      if (message && typeof message === "object") {
        const m = message as { featuredImage?: string };
        if (typeof m.featuredImage === "string" && m.featuredImage.trim()) {
          await destroyUrlsBestEffort(this.mediaStorage, [m.featuredImage]);
        }
      }

      return { status: 200, message: "Category deleted successfully" };
    } catch (e: unknown) {
      console.log(e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
