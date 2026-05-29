import type { MediaStorage } from "../ports/mediaStorage.js";
import { resolveImageForUpload } from "../media/cloudinaryUploadSource.js";

export type UploadImagesResult =
  | { ok: true; urls: string[] }
  | { ok: false; status: number; message: string };

export async function uploadMultimediaImages(
  sources: unknown[],
  mediaStorage: MediaStorage,
  folder: string
): Promise<UploadImagesResult> {
  const urls: string[] = [];
  for (const source of sources) {
    const decision = resolveImageForUpload(source);
    if (decision.upload) {
      const uploaded = await mediaStorage.upload({
        source: decision.source,
        folder,
        resourceType: "image",
      });
      urls.push(uploaded.secureUrl);
    } else if (decision.value) {
      urls.push(decision.value);
    }
  }
  return { ok: true, urls };
}

export async function resolveFeaturedImageField(
  rawImage: unknown,
  mediaStorage: MediaStorage | undefined,
  folder: string
): Promise<
  | { ok: true; featuredImage?: string; shouldSkip: boolean }
  | { ok: false; status: number; message: string }
> {
  const decision = resolveImageForUpload(rawImage);
  if (decision.upload) {
    if (!mediaStorage) {
      return {
        ok: false,
        status: 503,
        message: "Cloudinary no está configurado para imagen de portada",
      };
    }
    const uploaded = await mediaStorage.upload({
      source: decision.source,
      folder,
      resourceType: "image",
    });
    return { ok: true, featuredImage: uploaded.secureUrl, shouldSkip: false };
  }
  if (decision.value) {
    return { ok: true, featuredImage: decision.value, shouldSkip: false };
  }
  return { ok: true, shouldSkip: true };
}

export async function destroyUrlsBestEffort(
  mediaStorage: MediaStorage | undefined,
  urls: string[]
): Promise<void> {
  if (!mediaStorage?.destroyByUrl) {
    return;
  }
  for (const url of urls) {
    try {
      await mediaStorage.destroyByUrl(url);
    } catch (e: unknown) {
      console.log("[multimedia] no se pudo borrar imagen", url, e);
    }
  }
}
