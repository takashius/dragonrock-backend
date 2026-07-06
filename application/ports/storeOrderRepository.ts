import type {
  StoreOrderCustomerInput,
  StoreOrderLineItemSnapshot,
  StoreOrderOutcome,
} from "../types/storeOrderOutcome.js";

/**
 * Puerto de persistencia de pedidos de tienda (sin Mongoose en aplicación).
 */
export interface StoreOrderRepository {
  create(params: {
    customer: StoreOrderCustomerInput;
    items: StoreOrderLineItemSnapshot[];
    subtotal: number;
    total: number;
    notes?: string;
    companyId: string;
  }): Promise<StoreOrderOutcome>;
  paginate(params: {
    search?: string;
    filter: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<StoreOrderOutcome>;
  getDetail(id: string, companyId: string): Promise<StoreOrderOutcome>;
  softDelete(id: string, companyId: string): Promise<StoreOrderOutcome>;
}
