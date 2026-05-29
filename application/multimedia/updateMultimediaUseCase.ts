import type { MultimediaRepository } from "../ports/multimediaRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { MultimediaOutcome } from "../types/multimediaOutcome.js";
import { parseContentDate } from "./parseContentDate.js";
import { resolveGalleryImagesForUpdate } from "./resolveGalleryImagesForSave.js";
import {
  destroyUrlsBestEffort,
  resolveFeaturedImageField,
} from "./uploadMultimediaImages.js";
import {
  asMultimediaDoc,
  sanitizeMultimediaPayloadByType,
  stripMultimediaApiFields,
} from "./multimediaPayloadHelpers.js";

const COVER_FOLDER = "dragonrock/multimedia/cover";

export class UpdateMultimediaUseCase {
  constructor(
    private readonly multimedia: MultimediaRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  execute(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<MultimediaOutcome> {
    return this.updateWithMedia(data, companyId, editorUserId);
  }

  private async updateWithMedia(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<MultimediaOutcome> {
    const urlsToDestroy: string[] = [];

    try {
      const existingOutcome = await this.multimedia.getDetail(
        data.id,
        companyId
      );
      if (existingOutcome.status !== 200) {
        return existingOutcome;
      }
      const existing = asMultimediaDoc(existingOutcome.message);
      if (!existing) {
        return { status: 400, message: "Multimedia not found" };
      }

      const payload = { ...data };
      const nextType =
        typeof payload.type === "string" ? payload.type : existing.type ?? "";
      const previousType = existing.type ?? "";

      if ("date" in payload) {
        if (typeof payload.date !== "string") {
          return { status: 400, message: "Invalid date" };
        }
        const contentDate = parseContentDate(payload.date);
        if (!contentDate) {
          return {
            status: 400,
            message: "Invalid date format (expected YYYY-MM-DD)",
          };
        }
        payload.contentDate = contentDate;
      }

      let previousCover = existing.featuredImage;
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

      const previousGallery = existing.galleryImages ?? [];

      if (nextType === "gallery") {
        const hasGalleryUpdate =
          "existingGallery" in payload || "galleryImages" in payload;
        if (hasGalleryUpdate || previousType !== "gallery") {
          const galleryResult = await resolveGalleryImagesForUpdate({
            previousGallery:
              previousType === "gallery" ? previousGallery : [],
            galleryInput:
              "galleryImages" in payload ? payload.galleryImages : undefined,
            existingGallery:
              "galleryImages" in payload
                ? undefined
                : payload.existingGallery,
            newGalleryInput:
              "galleryImages" in payload
                ? undefined
                : payload.galleryImages,
            mediaStorage: this.mediaStorage,
          });
          if (!galleryResult.ok) {
            return {
              status: galleryResult.status,
              message: galleryResult.message,
            };
          }
          payload.galleryImages = galleryResult.galleryImages;
          urlsToDestroy.push(...galleryResult.removedUrls);
        }
      } else if (previousType === "gallery" && previousGallery.length > 0) {
        payload.clearGallery = true;
        urlsToDestroy.push(...previousGallery);
      }

      if (nextType === "video" && previousType !== "video") {
        payload.clearPodcast = true;
      }
      if (nextType === "podcast" && previousType !== "podcast") {
        payload.clearVideoUrl = true;
      }
      if (nextType === "gallery" && previousType === "video") {
        payload.clearVideoUrl = true;
      }
      if (nextType === "gallery" && previousType === "podcast") {
        payload.clearPodcast = true;
      }

      sanitizeMultimediaPayloadByType(payload, nextType);
      stripMultimediaApiFields(payload);

      const updated = await this.multimedia.update(
        payload,
        companyId,
        editorUserId
      );

      if (updated.status === 200) {
        await destroyUrlsBestEffort(this.mediaStorage, urlsToDestroy);
      }

      return updated;
    } catch (e: unknown) {
      console.log("[multimedia] update", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
