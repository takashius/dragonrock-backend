import type { MultimediaRepository } from "../ports/multimediaRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { MultimediaOutcome } from "../types/multimediaOutcome.js";
import { destroyUrlsBestEffort } from "./uploadMultimediaImages.js";

export class DeleteMultimediaUseCase {
  constructor(
    private readonly multimedia: MultimediaRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  async execute(id: string, companyId: string): Promise<MultimediaOutcome> {
    try {
      const outcome = await this.multimedia.softDelete(id, companyId);
      if (outcome.status !== 200) {
        return outcome;
      }

      const message = outcome.message;
      if (message && typeof message === "object") {
        const m = message as {
          featuredImage?: string;
          galleryImages?: string[];
        };
        const urls: string[] = [];
        if (typeof m.featuredImage === "string" && m.featuredImage.trim()) {
          urls.push(m.featuredImage);
        }
        if (Array.isArray(m.galleryImages)) {
          urls.push(
            ...m.galleryImages.filter(
              (u): u is string => typeof u === "string" && u.trim().length > 0
            )
          );
        }
        await destroyUrlsBestEffort(this.mediaStorage, urls);
      }

      return { status: 200, message: "Multimedia deleted successfully" };
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
