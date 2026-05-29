import type { LiveEventRepository } from "../ports/liveEventRepository.js";
import type { LiveEventOutcome } from "../types/liveEventOutcome.js";

export class GetPublicLiveEventDetailUseCase {
  constructor(private readonly liveEvents: LiveEventRepository) {}

  execute(id: string): Promise<LiveEventOutcome> {
    return this.liveEvents.getPublicDetail(id);
  }
}
