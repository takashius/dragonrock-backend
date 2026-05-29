import type { EntrepreneurshipOutcome } from "../types/entrepreneurshipOutcome.js";

/**
 * Puerto de persistencia de entrevistas Emprende (sin Mongoose en aplicación).
 */
export interface EntrepreneurshipRepository {
  listPublished(): Promise<EntrepreneurshipOutcome>;
  getPublishedDetail(id: string): Promise<EntrepreneurshipOutcome>;
  getDetail(id: string, companyId: string): Promise<EntrepreneurshipOutcome>;
  paginate(params: {
    search?: string;
    filter: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<EntrepreneurshipOutcome>;
  create(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<EntrepreneurshipOutcome>;
  update(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<EntrepreneurshipOutcome>;
  softDelete(id: string, companyId: string): Promise<EntrepreneurshipOutcome>;
}
