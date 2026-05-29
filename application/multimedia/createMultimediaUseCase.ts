import type { MultimediaRepository } from "../ports/multimediaRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { MultimediaOutcome } from "../types/multimediaOutcome.js";
import { parseContentDate } from "./parseContentDate.js";
import { resolveGalleryImagesForCreate } from "./resolveGalleryImagesForSave.js";
import {
  resolveFeaturedImageField,
} from "./uploadMultimediaImages.js";
import {
  sanitizeMultimediaPayloadByType,
  stripMultimediaApiFields,
} from "./multimediaPayloadHelpers.js";

const COVER_FOLDER = "dragonrock/multimedia/cover";

export class CreateMultimediaUseCase {
  constructor(
    private readonly multimedia: MultimediaRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  execute(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<MultimediaOutcome> {
    return this.createWithMedia(data, userId, companyId);
  }

  private async createWithMedia(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<MultimediaOutcome> {
    try {
      const payload = { ...data };
      const type = String(payload.type ?? "");

      if (typeof payload.date !== "string") {
        return { status: 400, message: "date is required" };
      }
      const contentDate = parseContentDate(payload.date);
      if (!contentDate) {
        return {
          status: 400,
          message: "Invalid date format (expected YYYY-MM-DD)",
        };
      }
      payload.contentDate = contentDate;

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
      }

      if (type === "gallery") {
        const galleryResult = await resolveGalleryImagesForCreate(
          payload.galleryImages,
          this.mediaStorage
        );
        if (!galleryResult.ok) {
          return {
            status: galleryResult.status,
            message: galleryResult.message,
          };
        }
        payload.galleryImages = galleryResult.galleryImages;
      }

      sanitizeMultimediaPayloadByType(payload, type);
      stripMultimediaApiFields(payload);

      return await this.multimedia.create(payload, userId, companyId);
    } catch (e: unknown) {
      console.log("[multimedia] create", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
