import type { MultimediaOutcome } from "../types/multimediaOutcome.js";

/**
 * Puerto de persistencia de contenido multimedia (sin Mongoose en aplicación).
 */
export interface MultimediaRepository {
  listPublished(): Promise<MultimediaOutcome>;
  getPublishedDetail(id: string): Promise<MultimediaOutcome>;
  getDetail(id: string, companyId: string): Promise<MultimediaOutcome>;
  paginate(params: {
    search?: string;
    filter: unknown;
    type?: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<MultimediaOutcome>;
  create(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<MultimediaOutcome>;
  update(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<MultimediaOutcome>;
  softDelete(id: string, companyId: string): Promise<MultimediaOutcome>;
}
