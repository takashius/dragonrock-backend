import type { ServiceRepository } from "../ports/serviceRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { ServiceOutcome } from "../types/serviceOutcome.js";
import {
  destroyUrlsBestEffort,
  resolveFeaturedImageField,
} from "../multimedia/uploadMultimediaImages.js";
import {
  asServiceDoc,
  stripServiceApiFields,
} from "./servicePayloadHelpers.js";

const COVER_FOLDER = "dragonrock/services/cover";

export class UpdateServiceUseCase {
  constructor(
    private readonly services: ServiceRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  execute(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<ServiceOutcome> {
    return this.updateWithImage(data, companyId, editorUserId);
  }

  private async updateWithImage(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<ServiceOutcome> {
    const urlsToDestroy: string[] = [];

    try {
      const existingOutcome = await this.services.getDetail(
        data.id,
        companyId
      );
      if (existingOutcome.status !== 200) {
        return existingOutcome;
      }
      const existing = asServiceDoc(existingOutcome.message);
      if (!existing) {
        return { status: 400, message: "Service not found" };
      }

      const payload = { ...data };
      const previousCover = existing.featuredImage;

      if ("image" in payload) {
        const coverResult = await resolveFeaturedImageField(
          payload.image,
          this.mediaStorage,
          COVER_FOLDER
        );
        if (!coverResult.ok) {
          return { status: coverResult.status, message: coverResult.message };
        }
        if (!coverResult.shouldSkip && coverResult.featuredImage) {
          payload.featuredImage = coverResult.featuredImage;
          if (
            previousCover &&
            previousCover !== coverResult.featuredImage
          ) {
            urlsToDestroy.push(previousCover);
          }
        } else if (coverResult.shouldSkip && payload.image === "") {
          payload.featuredImage = undefined;
          if (previousCover) {
            urlsToDestroy.push(previousCover);
          }
        }
      }

      if (payload.clearPrice === true) {
        payload.price = undefined;
      }

      stripServiceApiFields(payload);

      const updated = await this.services.update(
        payload,
        companyId,
        editorUserId
      );

      if (updated.status === 200) {
        await destroyUrlsBestEffort(this.mediaStorage, urlsToDestroy);
      }

      return updated;
    } catch (e: unknown) {
      console.log("[services] update", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
