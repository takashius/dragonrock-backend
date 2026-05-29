import { resolveImageForUpload } from "../../application/media/cloudinaryUploadSource.js";

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

/** Une galleryImages y galleryImages[] (nombre que envía el front en multipart). */
export function coalesceGalleryImagesField(
  body: Record<string, unknown>
): void {
  const bracket = body["galleryImages[]"];
  const current = body.galleryImages;
  const fromBracket =
    bracket === undefined
      ? []
      : Array.isArray(bracket)
        ? bracket
        : [bracket];
  const fromGallery =
    current === undefined
      ? []
      : Array.isArray(current)
        ? current
        : [current];
  if (fromBracket.length > 0 || fromGallery.length > 0) {
    body.galleryImages = [...fromGallery, ...fromBracket];
  }
  delete body["galleryImages[]"];
}

/** Convierte campos multipart (strings) al shape que espera Zod antes de validar. */
export function normalizeMultimediaMultipartBody(
  body: Record<string, unknown>
): void {
  coalesceGalleryImagesField(body);

  if ("isFeatured" in body) {
    body.isFeatured = coerceBoolean(body.isFeatured);
  }
  if ("season" in body) {
    body.season = coerceNumber(body.season);
  }
  if ("episode" in body) {
    body.episode = coerceNumber(body.episode);
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
