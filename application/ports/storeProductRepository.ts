import type { StoreProductOutcome } from "../types/storeProductOutcome.js";

/**
 * Puerto de persistencia de productos de tienda (sin Mongoose en aplicación).
 */
export interface StoreProductRepository {
  getDetail(id: string, companyId: string): Promise<StoreProductOutcome>;
  paginate(params: {
    search?: string;
    filter: unknown;
    category?: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<StoreProductOutcome>;
  create(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<StoreProductOutcome>;
  update(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<StoreProductOutcome>;
  softDelete(id: string, companyId: string): Promise<StoreProductOutcome>;
  listPublic(params: {
    search?: string;
    category?: string;
    page?: unknown;
    pageSize?: unknown;
  }): Promise<StoreProductOutcome>;
  getPublicDetail(id: string): Promise<StoreProductOutcome>;
  getPublicDetailBySlug(slug: string): Promise<StoreProductOutcome>;
}
