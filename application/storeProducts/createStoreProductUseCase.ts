import type { StoreCategoryRepository } from "../ports/storeCategoryRepository.js";
import type { StoreProductRepository } from "../ports/storeProductRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type {
  StoreProductOutcome,
  StoreProductStatus,
} from "../types/storeProductOutcome.js";
import { resolveFeaturedImageField } from "../multimedia/uploadMultimediaImages.js";
import { resolveProductGalleryForCreate } from "./resolveProductGalleryImages.js";
import {
  PRODUCT_COVER_FOLDER,
  resolveProductStatusFromStock,
  stripStoreProductApiFields,
} from "./storeProductPayloadHelpers.js";

export class CreateStoreProductUseCase {
  constructor(
    private readonly products: StoreProductRepository,
    private readonly categories: StoreCategoryRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  execute(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<StoreProductOutcome> {
    return this.createWithMedia(data, userId, companyId);
  }

  private async createWithMedia(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<StoreProductOutcome> {
    try {
      const payload = { ...data };

      const categoryId = String(payload.category ?? "").trim();
      if (!categoryId) {
        return { status: 400, message: "Category is required" };
      }
      const categoryOutcome = await this.categories.getDetail(
        categoryId,
        companyId
      );
      if (categoryOutcome.status !== 200) {
        return { status: 400, message: "Category not found" };
      }

      const coverResult = await resolveFeaturedImageField(
        payload.image,
        this.mediaStorage,
        PRODUCT_COVER_FOLDER
      );
      if (!coverResult.ok) {
        return { status: coverResult.status, message: coverResult.message };
      }
      if (coverResult.shouldSkip || !coverResult.featuredImage) {
        return { status: 400, message: "Main image is required" };
      }
      payload.featuredImage = coverResult.featuredImage;

      const galleryResult = await resolveProductGalleryForCreate(
        payload.galleryImages,
        this.mediaStorage
      );
      if (!galleryResult.ok) {
        return {
          status: galleryResult.status,
          message: galleryResult.message,
        };
      }
      payload.galleryImages = galleryResult.galleryImages;

      const stock = Number(payload.stock);
      const status = (payload.status ?? "activo") as StoreProductStatus;
      payload.stock = stock;
      payload.status = resolveProductStatusFromStock(stock, status);

      stripStoreProductApiFields(payload);

      return await this.products.create(payload, userId, companyId);
    } catch (e: unknown) {
      console.log("[storeProducts] create", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
