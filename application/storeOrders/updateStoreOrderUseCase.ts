import type { StoreOrderRepository } from "../ports/storeOrderRepository.js";
import type {
  StoreOrderOutcome,
  StoreOrderStatus,
} from "../types/storeOrderOutcome.js";

export class UpdateStoreOrderUseCase {
  constructor(private readonly orders: StoreOrderRepository) {}

  execute(
    data: { id: string; status: StoreOrderStatus },
    companyId: string
  ): Promise<StoreOrderOutcome> {
    return this.orders.update(data, companyId);
  }
}
