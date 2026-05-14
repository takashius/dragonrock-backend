import type { MediaStorage } from "../ports/mediaStorage.js";
import type { MediaDeletePayload, MediaOutcome } from "../types/mediaOutcome.js";

export class DeleteMediaUseCase {
  constructor(private readonly mediaStorage: MediaStorage) {}

  async execute(payload: MediaDeletePayload): Promise<MediaOutcome> {
    try {
      if (!payload.publicId?.trim()) {
        return {
          status: 400,
          message: "publicId es requerido",
        };
      }

      const destroyed = await this.mediaStorage.destroy(payload);
      return {
        status: 200,
        message: destroyed,
      };
    } catch (e: unknown) {
      console.log("[media] destroy", e);
      return {
        status: 500,
        message: "Error eliminando archivo",
        detail: e,
      };
    }
  }
}
