import type { StoreOrderRepository } from "../ports/storeOrderRepository.js";
import type { StoreOrderOutcome } from "../types/storeOrderOutcome.js";

export class PaginateStoreOrdersUseCase {
  constructor(private readonly orders: StoreOrderRepository) {}

  execute(params: {
    search?: string;
    filter: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<StoreOrderOutcome> {
    return this.orders.paginate(params);
  }
}
