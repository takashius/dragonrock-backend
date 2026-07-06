import type { StoreProductStatus } from "../types/storeProductOutcome.js";

export const PRODUCT_COVER_FOLDER = "dragonrock/store/products/cover";
export const PRODUCT_GALLERY_FOLDER = "dragonrock/store/products/gallery";

/** Si stock es 0, el estado pasa a agotado sin importar el enviado. */
export function resolveProductStatusFromStock(
  stock: number,
  status: StoreProductStatus
): StoreProductStatus {
  if (stock <= 0) {
    return "agotado";
  }
  return status;
}

// Ventas: el descuento de stock y status agotado se aplican en pedidos públicos (CreatePublicStoreOrderUseCase).

export function stripStoreProductApiFields(
  payload: Record<string, unknown>
): void {
  delete payload.image;
  delete payload.existingGallery;
  delete payload.clearGallery;
}

export function asStoreProductDoc(message: unknown): {
  featuredImage?: string;
  galleryImages?: string[];
  stock?: number;
} | null {
  if (!message || typeof message !== "object") {
    return null;
  }
  const m = message as Record<string, unknown>;
  return {
    featuredImage:
      typeof m.featuredImage === "string" ? m.featuredImage : undefined,
    galleryImages: Array.isArray(m.galleryImages)
      ? m.galleryImages.filter((u): u is string => typeof u === "string")
      : [],
    stock: typeof m.stock === "number" ? m.stock : undefined,
  };
}
