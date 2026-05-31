import type { ServiceRepository } from "../ports/serviceRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { ServiceOutcome } from "../types/serviceOutcome.js";
import { destroyUrlsBestEffort } from "../multimedia/uploadMultimediaImages.js";

export class DeleteServiceUseCase {
  constructor(
    private readonly services: ServiceRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  async execute(id: string, companyId: string): Promise<ServiceOutcome> {
    try {
      const outcome = await this.services.softDelete(id, companyId);
      if (outcome.status !== 200) {
        return outcome;
      }

      const message = outcome.message;
      if (message && typeof message === "object") {
        const m = message as { featuredImage?: string };
        if (typeof m.featuredImage === "string" && m.featuredImage.trim()) {
          await destroyUrlsBestEffort(this.mediaStorage, [m.featuredImage]);
        }
      }

      return { status: 200, message: "Service deleted successfully" };
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
