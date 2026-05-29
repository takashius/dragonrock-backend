import type { MediaStorage } from "../ports/mediaStorage.js";
import {
  isExistingCloudinaryUrl,
  resolveImageForUpload,
} from "../media/cloudinaryUploadSource.js";
import {
  uploadMultimediaImages,
  type UploadImagesResult,
} from "./uploadMultimediaImages.js";

const GALLERY_FOLDER = "dragonrock/multimedia/gallery";
const MAX_GALLERY_IMAGES = 20;

export type GallerySaveResult =
  | { ok: true; galleryImages: string[]; removedUrls: string[] }
  | { ok: false; status: number; message: string };

function normalizeGalleryInput(raw: unknown): unknown[] {
  if (raw === undefined || raw === null) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw;
  }
  return [raw];
}

function filterValidExistingUrls(
  existingGallery: unknown,
  previousGallery: string[]
): string[] {
  if (!Array.isArray(existingGallery)) {
    return [];
  }
  const previousSet = new Set(previousGallery);
  return existingGallery.filter(
    (url): url is string =>
      typeof url === "string" &&
      url.trim().length > 0 &&
      isExistingCloudinaryUrl(url) &&
      previousSet.has(url)
  );
}

/** Lista ordenada enviada en PATCH: URLs Cloudinary existentes se conservan; binarios/data URI se suben. */
async function resolveGalleryFromAuthoritativeList(
  items: unknown[],
  previousGallery: string[],
  mediaStorage: MediaStorage | undefined
): Promise<GallerySaveResult> {
  if (items.length > MAX_GALLERY_IMAGES) {
    return {
      ok: false,
      status: 400,
      message: `Gallery cannot exceed ${MAX_GALLERY_IMAGES} images`,
    };
  }

  const previousSet = new Set(previousGallery);
  const finalGallery: string[] = [];

  for (const item of items) {
    const decision = resolveImageForUpload(item);
    if (decision.upload) {
      if (!mediaStorage) {
        return {
          ok: false,
          status: 503,
          message: "Cloudinary no está configurado para imágenes de galería",
        };
      }
      const uploaded = await mediaStorage.upload({
        source: decision.source,
        folder: GALLERY_FOLDER,
        resourceType: "image",
      });
      finalGallery.push(uploaded.secureUrl);
    } else if (decision.value && previousSet.has(decision.value)) {
      finalGallery.push(decision.value);
    }
  }

  if (finalGallery.length === 0) {
    return {
      ok: false,
      status: 400,
      message: "Gallery content must have at least one image",
    };
  }

  const finalSet = new Set(finalGallery);
  const removedUrls = previousGallery.filter((url) => !finalSet.has(url));

  return { ok: true, galleryImages: finalGallery, removedUrls };
}

export async function resolveGalleryImagesForCreate(
  galleryInput: unknown,
  mediaStorage: MediaStorage | undefined
): Promise<GallerySaveResult> {
  const sources = normalizeGalleryInput(galleryInput);
  if (sources.length === 0) {
    return {
      ok: false,
      status: 400,
      message: "At least one gallery image is required for gallery content",
    };
  }
  if (sources.length > MAX_GALLERY_IMAGES) {
    return {
      ok: false,
      status: 400,
      message: `Gallery cannot exceed ${MAX_GALLERY_IMAGES} images`,
    };
  }

  const needsBinaryUpload = sources.some((s) => {
    const decision = resolveImageForUpload(s);
    return decision.upload;
  });

  if (needsBinaryUpload && !mediaStorage) {
    return {
      ok: false,
      status: 503,
      message: "Cloudinary no está configurado para imágenes de galería",
    };
  }

  if (!mediaStorage) {
    const urls = sources.filter(
      (s): s is string => typeof s === "string" && isExistingCloudinaryUrl(s)
    );
    if (urls.length === 0) {
      return {
        ok: false,
        status: 400,
        message: "At least one valid gallery image is required",
      };
    }
    return { ok: true, galleryImages: urls, removedUrls: [] };
  }

  const uploaded = await uploadMultimediaImages(
    sources,
    mediaStorage,
    GALLERY_FOLDER
  );
  if (!uploaded.ok) {
    return uploaded;
  }
  if (uploaded.urls.length === 0) {
    return {
      ok: false,
      status: 400,
      message: "At least one gallery image is required for gallery content",
    };
  }
  return { ok: true, galleryImages: uploaded.urls, removedUrls: [] };
}

export async function resolveGalleryImagesForUpdate(params: {
  previousGallery: string[];
  /** Lista final deseada (URLs existentes + binarios). Tiene prioridad sobre existingGallery. */
  galleryInput?: unknown;
  existingGallery?: unknown;
  newGalleryInput?: unknown;
  mediaStorage: MediaStorage | undefined;
}): Promise<GallerySaveResult> {
  const previousGallery = params.previousGallery ?? [];

  if (params.galleryInput !== undefined) {
    return resolveGalleryFromAuthoritativeList(
      normalizeGalleryInput(params.galleryInput),
      previousGallery,
      params.mediaStorage
    );
  }

  const kept =
    params.existingGallery !== undefined
      ? filterValidExistingUrls(params.existingGallery, previousGallery)
      : [...previousGallery];
  const newSources = normalizeGalleryInput(params.newGalleryInput);

  if (kept.length + newSources.length > MAX_GALLERY_IMAGES) {
    return {
      ok: false,
      status: 400,
      message: `Gallery cannot exceed ${MAX_GALLERY_IMAGES} images`,
    };
  }

  let newUrls: string[] = [];
  if (newSources.length > 0) {
    if (!params.mediaStorage) {
      return {
        ok: false,
        status: 503,
        message: "Cloudinary no está configurado para imágenes de galería",
      };
    }
    const uploaded: UploadImagesResult = await uploadMultimediaImages(
      newSources,
      params.mediaStorage,
      GALLERY_FOLDER
    );
    if (!uploaded.ok) {
      return uploaded;
    }
    newUrls = uploaded.urls;
  }

  const finalGallery = [...kept, ...newUrls];
  if (finalGallery.length === 0) {
    return {
      ok: false,
      status: 400,
      message: "Gallery content must have at least one image",
    };
  }

  const finalSet = new Set(finalGallery);
  const removedUrls = previousGallery.filter((url) => !finalSet.has(url));

  return { ok: true, galleryImages: finalGallery, removedUrls };
}

export { MAX_GALLERY_IMAGES, GALLERY_FOLDER };
