import type { StoreProductRepository } from "../ports/storeProductRepository.js";
import type { StoreProductOutcome } from "../types/storeProductOutcome.js";

export class GetStoreProductDetailUseCase {
  constructor(private readonly products: StoreProductRepository) {}

  execute(id: string, companyId: string): Promise<StoreProductOutcome> {
    return this.products.getDetail(id, companyId);
  }
}
