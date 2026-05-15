import type { NewsOutcome } from "../types/newsOutcome.js";

/**
 * Puerto de persistencia de noticias (sin Mongoose en la capa de aplicación).
 */
export interface NewsRepository {
  listPublished(): Promise<NewsOutcome>;
  getPublishedDetail(id: string): Promise<NewsOutcome>;
  listFirstForCompany(companyId: string): Promise<NewsOutcome>;
  getDetail(id: string, companyId: string): Promise<NewsOutcome>;
  paginate(params: {
    search?: string;
    filter: unknown;
    type?: "escenaRock" | "culturales" | "other";
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<NewsOutcome>;
  create(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<NewsOutcome>;
  update(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<NewsOutcome>;
  softDelete(id: string, companyId: string): Promise<NewsOutcome>;
}
