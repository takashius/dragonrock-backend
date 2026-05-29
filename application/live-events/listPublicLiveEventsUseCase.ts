import type { LiveEventRepository } from "../ports/liveEventRepository.js";
import type { LiveEventOutcome } from "../types/liveEventOutcome.js";

export class ListPublicLiveEventsUseCase {
  constructor(private readonly liveEvents: LiveEventRepository) {}

  execute(): Promise<LiveEventOutcome> {
    return this.liveEvents.listPublic();
  }
}
