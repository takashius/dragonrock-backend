export function sanitizeMultimediaPayloadByType(
  payload: Record<string, unknown>,
  type: string
): void {
  if (type === "video") {
    delete payload.season;
    delete payload.episode;
    delete payload.podcastUrl;
    delete payload.galleryImages;
  } else if (type === "podcast") {
    delete payload.videoUrl;
    delete payload.galleryImages;
  } else if (type === "gallery") {
    delete payload.videoUrl;
    delete payload.season;
    delete payload.episode;
    delete payload.podcastUrl;
  }
}

export function stripMultimediaApiFields(payload: Record<string, unknown>): void {
  delete payload.date;
  delete payload.image;
  delete payload.existingGallery;
  delete payload.clearGallery;
  delete payload.clearVideoUrl;
  delete payload.clearPodcast;
}

export function asMultimediaDoc(message: unknown): {
  type?: string;
  featuredImage?: string;
  galleryImages?: string[];
} | null {
  if (!message || typeof message !== "object") {
    return null;
  }
  const m = message as Record<string, unknown>;
  return {
    type: typeof m.type === "string" ? m.type : undefined,
    featuredImage:
      typeof m.featuredImage === "string" ? m.featuredImage : undefined,
    galleryImages: Array.isArray(m.galleryImages)
      ? m.galleryImages.filter((u): u is string => typeof u === "string")
      : [],
  };
}
