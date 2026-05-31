import { resolveImageForUpload } from "../../application/media/cloudinaryUploadSource.js";
import { coalesceGalleryImagesField } from "./normalizeMultimediaMultipartBody.js";

function tryParseJson(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) {
    return value;
  }
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}

function coerceBoolean(value: unknown): unknown {
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true" || v === "1") {
      return true;
    }
    if (v === "false" || v === "0" || v === "") {
      return false;
    }
  }
  return value;
}

function coerceNumber(value: unknown): unknown {
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) {
      return n;
    }
  }
  return value;
}

function parseTags(value: unknown): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value
      .map((t) => (typeof t === "string" ? t.trim() : ""))
      .filter((t) => t.length > 0);
  }
  if (typeof value === "string") {
    const parsed = tryParseJson(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((t) => (typeof t === "string" ? t.trim() : ""))
        .filter((t) => t.length > 0);
    }
    return value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }
  return undefined;
}

function normalizeGalleryItem(value: unknown): string | undefined {
  const decision = resolveImageForUpload(value);
  if (decision.upload) {
    return typeof value === "string" ? value.trim() : undefined;
  }
  if (decision.value) {
    return decision.value;
  }
  return undefined;
}

function filterCoverImage(value: unknown): unknown {
  const decision = resolveImageForUpload(value);
  if (decision.upload) {
    return typeof value === "string" ? value.trim() : undefined;
  }
  if (decision.value) {
    return decision.value;
  }
  return undefined;
}

/** Convierte campos multipart (strings) al shape que espera Zod antes de validar. */
export function normalizeStoreProductMultipartBody(
  body: Record<string, unknown>
): void {
  coalesceGalleryImagesField(body);

  if ("isFeatured" in body) {
    body.isFeatured = coerceBoolean(body.isFeatured);
  }
  if ("clearCompareAtPrice" in body) {
    body.clearCompareAtPrice = coerceBoolean(body.clearCompareAtPrice);
  }
  if ("price" in body) {
    body.price = coerceNumber(body.price);
  }
  if ("compareAtPrice" in body) {
    const coerced = coerceNumber(body.compareAtPrice);
    if (coerced === undefined || coerced === "") {
      delete body.compareAtPrice;
    } else {
      body.compareAtPrice = coerced;
    }
  }
  if ("stock" in body) {
    body.stock = coerceNumber(body.stock);
  }
  if ("tags" in body) {
    const tags = parseTags(body.tags);
    if (tags !== undefined) {
      body.tags = tags;
    }
  }
  if ("existingGallery" in body) {
    body.existingGallery = tryParseJson(body.existingGallery);
  }
  if ("image" in body) {
    const filtered = filterCoverImage(body.image);
    if (filtered === undefined) {
      delete body.image;
    } else {
      body.image = filtered;
    }
  }
  if ("galleryImages" in body) {
    const raw = body.galleryImages;
    const items = Array.isArray(raw) ? raw : raw !== undefined ? [raw] : [];
    body.galleryImages = items
      .map((item) => normalizeGalleryItem(item))
      .filter((item): item is string => typeof item === "string");
    if ((body.galleryImages as string[]).length === 0) {
      delete body.galleryImages;
    }
  }
}
