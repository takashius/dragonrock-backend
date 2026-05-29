import type { LiveEventRepository } from "../ports/liveEventRepository.js";
import type { LiveEventOutcome } from "../types/liveEventOutcome.js";

export class DeleteLiveEventUseCase {
  constructor(private readonly liveEvents: LiveEventRepository) {}

  async execute(id: string, companyId: string): Promise<LiveEventOutcome> {
    try {
      return await this.liveEvents.softDelete(id, companyId);
    } catch (e: unknown) {
      console.log(e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
