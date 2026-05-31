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

function coercePrice(value: unknown): unknown {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return undefined;
    }
    const n = Number(trimmed);
    if (Number.isFinite(n)) {
      return n;
    }
    return value;
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
export function normalizeServiceMultipartBody(
  body: Record<string, unknown>
): void {
  if ("isFeatured" in body) {
    body.isFeatured = coerceBoolean(body.isFeatured);
  }
  if ("showPriceFrom" in body) {
    body.showPriceFrom = coerceBoolean(body.showPriceFrom);
  }
  if ("clearPrice" in body) {
    body.clearPrice = coerceBoolean(body.clearPrice);
  }
  if ("price" in body) {
    const coerced = coercePrice(body.price);
    if (coerced === undefined) {
      delete body.price;
      body.clearPrice = true;
    } else {
      body.price = coerced;
    }
  }
  if ("tags" in body) {
    const tags = parseTags(body.tags);
    if (tags !== undefined) {
      body.tags = tags;
    }
  }
  if ("image" in body) {
    const filtered = filterCoverImage(body.image);
    if (filtered === undefined) {
      delete body.image;
    } else {
      body.image = filtered;
    }
  }
}
