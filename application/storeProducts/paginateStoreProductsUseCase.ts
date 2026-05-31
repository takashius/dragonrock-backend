import type { StoreProductRepository } from "../ports/storeProductRepository.js";
import type { StoreProductOutcome } from "../types/storeProductOutcome.js";

export class PaginateStoreProductsUseCase {
  constructor(private readonly products: StoreProductRepository) {}

  execute(params: {
    search?: string;
    filter: unknown;
    category?: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<StoreProductOutcome> {
    return this.products.paginate(params);
  }
}
