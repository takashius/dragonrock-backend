import type { LiveEventRepository } from "../ports/liveEventRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { LiveEventOutcome } from "../types/liveEventOutcome.js";
import { resolveImageForUpload } from "../media/cloudinaryUploadSource.js";
import { mergeEventDateTime } from "./mergeEventDateTime.js";

export class CreateLiveEventUseCase {
  constructor(
    private readonly liveEvents: LiveEventRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  execute(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<LiveEventOutcome> {
    return this.createWithImage(data, userId, companyId);
  }

  private async createWithImage(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<LiveEventOutcome> {
    try {
      const payload = { ...data };
      const date = payload.date;
      const time = payload.time;
      if (typeof date !== "string" || typeof time !== "string") {
        return { status: 400, message: "date and time are required" };
      }
      const eventDate = mergeEventDateTime(date, time);
      if (!eventDate) {
        return {
          status: 400,
          message: "Invalid date or time format (expected YYYY-MM-DD and HH:mm)",
        };
      }
      payload.eventDate = eventDate;
      delete payload.date;
      delete payload.time;

      const imageDecision = resolveImageForUpload(payload.image);
      if (imageDecision.upload) {
        if (!this.mediaStorage) {
          return {
            status: 503,
            message: "Cloudinary no está configurado para imagen de evento",
          };
        }
        const uploaded = await this.mediaStorage.upload({
          source: imageDecision.source,
          folder: "dragonrock/live-events",
          resourceType: "image",
        });
        payload.image = uploaded.secureUrl;
      } else if (imageDecision.value) {
        payload.image = imageDecision.value;
      } else {
        delete payload.image;
      }

      return await this.liveEvents.create(payload, userId, companyId);
    } catch (e: unknown) {
      console.log("[live-events] create", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
