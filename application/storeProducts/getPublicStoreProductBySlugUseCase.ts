import type { StoreProductRepository } from "../ports/storeProductRepository.js";
import type { StoreProductOutcome } from "../types/storeProductOutcome.js";

export class GetPublicStoreProductBySlugUseCase {
  constructor(private readonly products: StoreProductRepository) {}

  execute(slug: string): Promise<StoreProductOutcome> {
    return this.products.getPublicDetailBySlug(slug);
  }
}
