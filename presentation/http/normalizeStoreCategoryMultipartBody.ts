import { resolveImageForUpload } from "../../application/media/cloudinaryUploadSource.js";

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
export function normalizeStoreCategoryMultipartBody(
  body: Record<string, unknown>
): void {
  if ("image" in body) {
    const filtered = filterCoverImage(body.image);
    if (filtered === undefined) {
      delete body.image;
    } else {
      body.image = filtered;
    }
  }
}
