import type { StoreCategoryOutcome } from "../types/storeCategoryOutcome.js";

/**
 * Puerto de persistencia de categorías de tienda (sin Mongoose en aplicación).
 */
export interface StoreCategoryRepository {
  listSimple(companyId: string): Promise<StoreCategoryOutcome>;
  getDetail(id: string, companyId: string): Promise<StoreCategoryOutcome>;
  paginate(params: {
    search?: string;
    filter: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<StoreCategoryOutcome>;
  create(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<StoreCategoryOutcome>;
  update(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<StoreCategoryOutcome>;
  softDelete(id: string, companyId: string): Promise<StoreCategoryOutcome>;
  listPublic(): Promise<StoreCategoryOutcome>;
}
