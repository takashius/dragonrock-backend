import type { MediaStorage } from "../ports/mediaStorage.js";
import {
  isExistingCloudinaryUrl,
  resolveImageForUpload,
} from "../media/cloudinaryUploadSource.js";
import {
  uploadMultimediaImages,
  type UploadImagesResult,
} from "../multimedia/uploadMultimediaImages.js";
import { PRODUCT_GALLERY_FOLDER } from "./storeProductPayloadHelpers.js";

const MAX_GALLERY_IMAGES = 20;

export type ProductGallerySaveResult =
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

async function resolveGalleryFromAuthoritativeList(
  items: unknown[],
  previousGallery: string[],
  mediaStorage: MediaStorage | undefined,
  galleryFolder: string
): Promise<ProductGallerySaveResult> {
  if (items.length > MAX_GALLERY_IMAGES) {
    return {
      ok: false,
      status: 400,
      message: `Gallery cannot exceed ${MAX_GALLERY_IMAGES} images`,
    };
  }

  if (items.length === 0) {
    return {
      ok: true,
      galleryImages: [],
      removedUrls: [...previousGallery],
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
        folder: galleryFolder,
        resourceType: "image",
      });
      finalGallery.push(uploaded.secureUrl);
    } else if (decision.value && previousSet.has(decision.value)) {
      finalGallery.push(decision.value);
    } else if (decision.value && isExistingCloudinaryUrl(decision.value)) {
      finalGallery.push(decision.value);
    }
  }

  const finalSet = new Set(finalGallery);
  const removedUrls = previousGallery.filter((url) => !finalSet.has(url));

  return { ok: true, galleryImages: finalGallery, removedUrls };
}

export async function resolveProductGalleryForCreate(
  galleryInput: unknown,
  mediaStorage: MediaStorage | undefined,
  galleryFolder: string = PRODUCT_GALLERY_FOLDER
): Promise<ProductGallerySaveResult> {
  const sources = normalizeGalleryInput(galleryInput);
  if (sources.length === 0) {
    return { ok: true, galleryImages: [], removedUrls: [] };
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
    return { ok: true, galleryImages: urls, removedUrls: [] };
  }

  const uploaded = await uploadMultimediaImages(
    sources,
    mediaStorage,
    galleryFolder
  );
  if (!uploaded.ok) {
    return uploaded;
  }
  return { ok: true, galleryImages: uploaded.urls, removedUrls: [] };
}

export async function resolveProductGalleryForUpdate(params: {
  previousGallery: string[];
  galleryInput?: unknown;
  existingGallery?: unknown;
  newGalleryInput?: unknown;
  mediaStorage: MediaStorage | undefined;
  galleryFolder?: string;
}): Promise<ProductGallerySaveResult> {
  const previousGallery = params.previousGallery ?? [];
  const galleryFolder = params.galleryFolder ?? PRODUCT_GALLERY_FOLDER;

  if (params.galleryInput !== undefined) {
    return resolveGalleryFromAuthoritativeList(
      normalizeGalleryInput(params.galleryInput),
      previousGallery,
      params.mediaStorage,
      galleryFolder
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
      galleryFolder
    );
    if (!uploaded.ok) {
      return uploaded;
    }
    newUrls = uploaded.urls;
  }

  const finalGallery = [...kept, ...newUrls];
  const finalSet = new Set(finalGallery);
  const removedUrls = previousGallery.filter((url) => !finalSet.has(url));

  return { ok: true, galleryImages: finalGallery, removedUrls };
}

export { MAX_GALLERY_IMAGES };
