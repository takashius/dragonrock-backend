import type { StoreOrderRepository } from "../ports/storeOrderRepository.js";
import type { StoreOrderOutcome } from "../types/storeOrderOutcome.js";

export class GetStoreOrderDetailUseCase {
  constructor(private readonly orders: StoreOrderRepository) {}

  execute(id: string, companyId: string): Promise<StoreOrderOutcome> {
    return this.orders.getDetail(id, companyId);
  }
}
