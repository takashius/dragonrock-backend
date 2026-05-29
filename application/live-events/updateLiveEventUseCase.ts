import type { LiveEventRepository } from "../ports/liveEventRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { LiveEventOutcome } from "../types/liveEventOutcome.js";
import { resolveImageForUpload } from "../media/cloudinaryUploadSource.js";
import { mergeEventDateTime } from "./mergeEventDateTime.js";

export class UpdateLiveEventUseCase {
  constructor(
    private readonly liveEvents: LiveEventRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  execute(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<LiveEventOutcome> {
    return this.updateWithImage(data, companyId, editorUserId);
  }

  private async updateWithImage(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<LiveEventOutcome> {
    try {
      const payload = { ...data };
      const hasDate = "date" in payload;
      const hasTime = "time" in payload;

      if (hasDate || hasTime) {
        if (!hasDate || !hasTime) {
          return {
            status: 400,
            message: "Both date and time must be provided to update eventDate",
          };
        }
        const date = payload.date;
        const time = payload.time;
        if (typeof date !== "string" || typeof time !== "string") {
          return { status: 400, message: "Invalid date or time" };
        }
        const eventDate = mergeEventDateTime(date, time);
        if (!eventDate) {
          return {
            status: 400,
            message:
              "Invalid date or time format (expected YYYY-MM-DD and HH:mm)",
          };
        }
        payload.eventDate = eventDate;
        delete payload.date;
        delete payload.time;
      }

      const imageDecision = resolveImageForUpload(payload.image);
      let shouldReplaceImage = false;
      let previousImage: string | undefined;

      if (imageDecision.upload) {
        if (!this.mediaStorage) {
          return {
            status: 503,
            message: "Cloudinary no está configurado para imagen de evento",
          };
        }

        const existing = await this.liveEvents.getDetail(payload.id, companyId);
        if (
          existing.status === 200 &&
          existing.message &&
          typeof existing.message === "object" &&
          "image" in existing.message
        ) {
          const maybeImage = (existing.message as { image?: unknown }).image;
          if (typeof maybeImage === "string" && maybeImage.trim()) {
            previousImage = maybeImage;
          }
        }

        const uploaded = await this.mediaStorage.upload({
          source: imageDecision.source,
          folder: "dragonrock/live-events",
          resourceType: "image",
        });
        payload.image = uploaded.secureUrl;
        shouldReplaceImage = true;
      } else if (imageDecision.value) {
        payload.image = imageDecision.value;
      } else if ("image" in payload) {
        delete payload.image;
      }

      const updated = await this.liveEvents.update(
        payload,
        companyId,
        editorUserId
      );

      if (
        updated.status === 200 &&
        shouldReplaceImage &&
        previousImage &&
        previousImage !== payload.image &&
        this.mediaStorage?.destroyByUrl
      ) {
        try {
          await this.mediaStorage.destroyByUrl(previousImage);
        } catch (cleanupError: unknown) {
          console.log(
            "[live-events] no se pudo borrar imagen previa",
            cleanupError
          );
        }
      }

      return updated;
    } catch (e: unknown) {
      console.log("[live-events] update", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
