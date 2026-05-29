import type { LiveEventRepository } from "../ports/liveEventRepository.js";
import type { LiveEventOutcome } from "../types/liveEventOutcome.js";

export class GetLiveEventDetailUseCase {
  constructor(private readonly liveEvents: LiveEventRepository) {}

  execute(id: string, companyId: string): Promise<LiveEventOutcome> {
    return this.liveEvents.getDetail(id, companyId);
  }
}
