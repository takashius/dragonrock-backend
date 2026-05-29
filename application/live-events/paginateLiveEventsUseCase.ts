import type { LiveEventRepository } from "../ports/liveEventRepository.js";
import type { LiveEventOutcome } from "../types/liveEventOutcome.js";

export class PaginateLiveEventsUseCase {
  constructor(private readonly liveEvents: LiveEventRepository) {}

  execute(params: {
    search?: string;
    filter: unknown;
    type?: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<LiveEventOutcome> {
    return this.liveEvents.paginate(params);
  }
}
