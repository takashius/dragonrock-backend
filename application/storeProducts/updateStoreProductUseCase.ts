import type { StoreCategoryRepository } from "../ports/storeCategoryRepository.js";
import type { StoreProductRepository } from "../ports/storeProductRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type {
  StoreProductOutcome,
  StoreProductStatus,
} from "../types/storeProductOutcome.js";
import {
  destroyUrlsBestEffort,
  resolveFeaturedImageField,
} from "../multimedia/uploadMultimediaImages.js";
import { resolveProductGalleryForUpdate } from "./resolveProductGalleryImages.js";
import {
  asStoreProductDoc,
  PRODUCT_COVER_FOLDER,
  resolveProductStatusFromStock,
  stripStoreProductApiFields,
} from "./storeProductPayloadHelpers.js";

export class UpdateStoreProductUseCase {
  constructor(
    private readonly products: StoreProductRepository,
    private readonly categories: StoreCategoryRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  execute(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<StoreProductOutcome> {
    return this.updateWithMedia(data, companyId, editorUserId);
  }

  private async updateWithMedia(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<StoreProductOutcome> {
    const urlsToDestroy: string[] = [];

    try {
      const existingOutcome = await this.products.getDetail(
        data.id,
        companyId
      );
      if (existingOutcome.status !== 200) {
        return existingOutcome;
      }
      const existing = asStoreProductDoc(existingOutcome.message);
      if (!existing) {
        return { status: 400, message: "Product not found" };
      }

      const payload = { ...data };
      const previousCover = existing.featuredImage;
      const previousGallery = existing.galleryImages ?? [];

      if (payload.category !== undefined) {
        const categoryId = String(payload.category).trim();
        const categoryOutcome = await this.categories.getDetail(
          categoryId,
          companyId
        );
        if (categoryOutcome.status !== 200) {
          return { status: 400, message: "Category not found" };
        }
      }

      if ("image" in payload) {
        const coverResult = await resolveFeaturedImageField(
          payload.image,
          this.mediaStorage,
          PRODUCT_COVER_FOLDER
        );
        if (!coverResult.ok) {
          return { status: coverResult.status, message: coverResult.message };
        }
        if (!coverResult.shouldSkip && coverResult.featuredImage) {
          payload.featuredImage = coverResult.featuredImage;
          if (
            previousCover &&
            previousCover !== coverResult.featuredImage
          ) {
            urlsToDestroy.push(previousCover);
          }
        } else if (coverResult.shouldSkip && payload.image === "") {
          payload.featuredImage = undefined;
          if (previousCover) {
            urlsToDestroy.push(previousCover);
          }
        }
      }

      const hasGalleryUpdate =
        "existingGallery" in payload || "galleryImages" in payload;
      if (hasGalleryUpdate) {
        const galleryResult = await resolveProductGalleryForUpdate({
          previousGallery,
          galleryInput:
            "galleryImages" in payload ? payload.galleryImages : undefined,
          existingGallery:
            "galleryImages" in payload
              ? undefined
              : payload.existingGallery,
          newGalleryInput:
            "galleryImages" in payload
              ? undefined
              : payload.galleryImages,
          mediaStorage: this.mediaStorage,
        });
        if (!galleryResult.ok) {
          return {
            status: galleryResult.status,
            message: galleryResult.message,
          };
        }
        payload.galleryImages = galleryResult.galleryImages;
        urlsToDestroy.push(...galleryResult.removedUrls);
      }

      const nextStock =
        payload.stock !== undefined ? Number(payload.stock) : existing.stock;
      if (nextStock !== undefined) {
        payload.stock = nextStock;
        const requestedStatus = (payload.status ??
          (existingOutcome.message as { status?: StoreProductStatus })
            .status ??
          "activo") as StoreProductStatus;
        payload.status = resolveProductStatusFromStock(
          nextStock,
          requestedStatus
        );
      } else if (payload.status !== undefined) {
        const currentStock = existing.stock ?? 0;
        payload.status = resolveProductStatusFromStock(
          currentStock,
          payload.status as StoreProductStatus
        );
      }

      if (payload.clearCompareAtPrice === true) {
        payload.compareAtPrice = undefined;
      }

      stripStoreProductApiFields(payload);

      const updated = await this.products.update(
        payload,
        companyId,
        editorUserId
      );

      if (updated.status === 200) {
        await destroyUrlsBestEffort(this.mediaStorage, urlsToDestroy);
      }

      return updated;
    } catch (e: unknown) {
      console.log("[storeProducts] update", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
