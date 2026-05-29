import { shouldUploadToCloudinary } from "../../application/media/cloudinaryUploadSource.js";

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

/** Convierte campos multipart (strings) al shape que espera Zod antes de validar. */
export function normalizeEntrepreneurshipMultipartBody(
  body: Record<string, unknown>
): void {
  if ("questions" in body) {
    body.questions = tryParseJson(body.questions);
  }
  if ("keyLearnings" in body) {
    body.keyLearnings = tryParseJson(body.keyLearnings);
  }
  if ("isFeatured" in body) {
    body.isFeatured = coerceBoolean(body.isFeatured);
  }
  const featured = body.featuredImage;
  if (
    typeof featured === "string" &&
    featured.trim() &&
    !shouldUploadToCloudinary(featured)
  ) {
    delete body.featuredImage;
  }
}
