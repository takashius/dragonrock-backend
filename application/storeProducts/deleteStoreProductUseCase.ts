import type { StoreProductRepository } from "../ports/storeProductRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { StoreProductOutcome } from "../types/storeProductOutcome.js";
import { destroyUrlsBestEffort } from "../multimedia/uploadMultimediaImages.js";

export class DeleteStoreProductUseCase {
  constructor(
    private readonly products: StoreProductRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  async execute(id: string, companyId: string): Promise<StoreProductOutcome> {
    try {
      const outcome = await this.products.softDelete(id, companyId);
      if (outcome.status !== 200) {
        return outcome;
      }

      const message = outcome.message;
      if (message && typeof message === "object") {
        const m = message as {
          featuredImage?: string;
          galleryImages?: string[];
        };
        const urls: string[] = [];
        if (typeof m.featuredImage === "string" && m.featuredImage.trim()) {
          urls.push(m.featuredImage);
        }
        if (Array.isArray(m.galleryImages)) {
          urls.push(
            ...m.galleryImages.filter(
              (u): u is string => typeof u === "string" && u.trim().length > 0
            )
          );
        }
        await destroyUrlsBestEffort(this.mediaStorage, urls);
      }

      return { status: 200, message: "Product deleted successfully" };
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
