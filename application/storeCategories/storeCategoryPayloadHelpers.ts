export function stripStoreCategoryApiFields(
  payload: Record<string, unknown>
): void {
  delete payload.image;
}

export function asStoreCategoryDoc(message: unknown): {
  featuredImage?: string;
} | null {
  if (!message || typeof message !== "object") {
    return null;
  }
  const m = message as Record<string, unknown>;
  return {
    featuredImage:
      typeof m.featuredImage === "string" ? m.featuredImage : undefined,
  };
}
