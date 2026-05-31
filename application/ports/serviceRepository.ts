import type { ServiceOutcome } from "../types/serviceOutcome.js";

/**
 * Puerto de persistencia de servicios (sin Mongoose en aplicación).
 */
export interface ServiceRepository {
  listPublished(): Promise<ServiceOutcome>;
  getPublishedDetail(id: string): Promise<ServiceOutcome>;
  getDetail(id: string, companyId: string): Promise<ServiceOutcome>;
  paginate(params: {
    search?: string;
    filter: unknown;
    category?: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<ServiceOutcome>;
  create(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<ServiceOutcome>;
  update(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<ServiceOutcome>;
  softDelete(id: string, companyId: string): Promise<ServiceOutcome>;
}
