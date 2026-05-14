import type { MediaStorage } from "../ports/mediaStorage.js";
import type { MediaOutcome, MediaUploadPayload } from "../types/mediaOutcome.js";

export class UploadMediaUseCase {
  constructor(private readonly mediaStorage: MediaStorage) {}

  async execute(payload: MediaUploadPayload): Promise<MediaOutcome> {
    try {
      if (!payload.source?.trim()) {
        return {
          status: 400,
          message: "source es requerido",
        };
      }

      const uploaded = await this.mediaStorage.upload(payload);
      return {
        status: 200,
        message: uploaded,
      };
    } catch (e: unknown) {
      console.log("[media] upload", e);
      return {
        status: 500,
        message: "Error subiendo archivo",
        detail: e,
      };
    }
  }
}
