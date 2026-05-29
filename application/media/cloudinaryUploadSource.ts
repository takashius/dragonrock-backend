/**
 * Indica si `source` es un valor que Cloudinary puede subir (data URI o URL remota).
 * Cualquier otro string (p. ej. placeholder "string" en multipart) se trata como ruta local
 * y provoca ENOENT al llamar a uploader.upload.
 */
export function shouldUploadToCloudinary(source: string): boolean {
  const trimmed = source.trim();
  if (!trimmed) {
    return false;
  }
  if (trimmed.startsWith("data:")) {
    return true;
  }
  return /^https?:\/\//i.test(trimmed);
}

/** URL ya alojada en Cloudinary; no hace falta volver a subirla en un PATCH. */
export function isExistingCloudinaryUrl(source: string): boolean {
  try {
    const parsed = new URL(source.trim());
    return parsed.hostname.includes("res.cloudinary.com");
  } catch {
    return false;
  }
}

/**
 * Normaliza featuredImage: omite placeholders; conserva URLs Cloudinary existentes.
 * Devuelve si debe ejecutarse upload (data URI o URL remota no-Cloudinary).
 */
export function resolveFeaturedImageForUpload(
  raw: unknown
): { upload: false; value?: string } | { upload: true; source: string } {
  if (typeof raw !== "string") {
    return { upload: false };
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return { upload: false };
  }
  if (isExistingCloudinaryUrl(trimmed)) {
    return { upload: false, value: trimmed };
  }
  if (shouldUploadToCloudinary(trimmed)) {
    return { upload: true, source: trimmed };
  }
  return { upload: false };
}

/** Alias genérico para campos `image` u otros distintos de `featuredImage`. */
export const resolveImageForUpload = resolveFeaturedImageForUpload;
