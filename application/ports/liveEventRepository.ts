import type { LiveEventOutcome } from "../types/liveEventOutcome.js";

/**
 * Puerto de persistencia de eventos en vivo (sin Mongoose en aplicación).
 */
export interface LiveEventRepository {
  listPublic(): Promise<LiveEventOutcome>;
  getPublicDetail(id: string): Promise<LiveEventOutcome>;
  getDetail(id: string, companyId: string): Promise<LiveEventOutcome>;
  paginate(params: {
    search?: string;
    filter: unknown;
    type?: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<LiveEventOutcome>;
  create(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<LiveEventOutcome>;
  update(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<LiveEventOutcome>;
  softDelete(id: string, companyId: string): Promise<LiveEventOutcome>;
}
