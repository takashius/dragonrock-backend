import { shouldUploadToCloudinary } from "../../application/media/cloudinaryUploadSource.js";

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

/** Convierte campos multipart (strings) al shape que espera Zod antes de validar. */
export function normalizeLiveEventMultipartBody(
  body: Record<string, unknown>
): void {
  if ("isFeatured" in body) {
    body.isFeatured = coerceBoolean(body.isFeatured);
  }
  if ("latitude" in body) {
    body.latitude = coerceNumber(body.latitude);
  }
  if ("longitude" in body) {
    body.longitude = coerceNumber(body.longitude);
  }
  if ("price" in body) {
    body.price = coerceNumber(body.price);
  }
  const image = body.image;
  if (
    typeof image === "string" &&
    image.trim() &&
    !shouldUploadToCloudinary(image)
  ) {
    delete body.image;
  }
}
