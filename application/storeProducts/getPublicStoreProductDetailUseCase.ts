import type { StoreProductRepository } from "../ports/storeProductRepository.js";
import type { StoreProductOutcome } from "../types/storeProductOutcome.js";

export class GetPublicStoreProductDetailUseCase {
  constructor(private readonly products: StoreProductRepository) {}

  execute(id: string): Promise<StoreProductOutcome> {
    return this.products.getPublicDetail(id);
  }
}
