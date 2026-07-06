import type { StoreProductRepository } from "../ports/storeProductRepository.js";
import type { StoreProductOutcome } from "../types/storeProductOutcome.js";

export class ListPublicStoreProductsUseCase {
  constructor(private readonly products: StoreProductRepository) {}

  execute(params: {
    search?: string;
    category?: string;
    page?: unknown;
    pageSize?: unknown;
  }): Promise<StoreProductOutcome> {
    return this.products.listPublic(params);
  }
}
