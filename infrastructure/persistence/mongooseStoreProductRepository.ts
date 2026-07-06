import StoreProduct from "./mongoose/storeProductModel.js";
import type { StoreProductRepository } from "../../application/ports/storeProductRepository.js";
import type { StoreProductOutcome } from "../../application/types/storeProductOutcome.js";
import {
  listPublicActiveCategoryIds,
  resolvePublicActiveCategoryId,
} from "./storePublicHelpers.js";
import { publicProductSelect } from "./storePublicSelects.js";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const listSelect =
  "name slug category status price compareAtPrice stock sku description featuredImage galleryImages isFeatured tags created history";

const categoryPopulate = {
  path: "category" as const,
  select: ["name", "slug"],
  match: { active: true, status: "activa" },
  model: "StoreCategory",
};

function isPublicProductAvailable(
  doc: { category?: unknown } | null
): doc is { category: unknown } {
  return Boolean(doc?.category);
}

export class MongooseStoreProductRepository implements StoreProductRepository {
  async getDetail(id: string, companyId: string): Promise<StoreProductOutcome> {
    try {
      if (!id?.trim()) {
        return { status: 400, message: "Product id is required" };
      }
      const result = await StoreProduct.findOne({
        _id: id,
        active: true,
        company: companyId,
      })
        .populate({
          path: "category",
          select: ["name", "slug", "status"],
          model: "StoreCategory",
        })
        .populate({
          path: "created.user",
          select: ["name", "lastname"],
          model: "User",
        })
        .populate({
          path: "history.user",
          select: ["name", "lastname"],
          model: "User",
        });
      if (!result) {
        return { status: 404, message: "Product not found" };
      }
      return { status: 200, message: result };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid product id" };
      }
      console.log("[ERROR] -> getStoreProductDetail", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async paginate(params: {
    search?: string;
    filter: unknown;
    category?: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<StoreProductOutcome> {
    try {
      const defaultLimit = 20;
      const maxLimit = 100;
      const searchText =
        params.search !== undefined && params.search !== null
          ? String(params.search).trim()
          : params.filter === undefined || params.filter === null
            ? ""
            : String(params.filter).trim();

      const query: Record<string, unknown> = {
        active: true,
        company: params.companyId,
      };

      if (
        params.category !== undefined &&
        params.category !== null &&
        String(params.category).trim()
      ) {
        query.category = String(params.category).trim();
      }
      if (
        params.status !== undefined &&
        params.status !== null &&
        String(params.status).trim()
      ) {
        query.status = String(params.status).trim();
      }

      if (searchText) {
        const regex = { $regex: escapeRegex(searchText), $options: "i" };
        query.$or = [
          { name: regex },
          { slug: regex },
          { sku: regex },
          { description: regex },
          { tags: regex },
        ];
      }

      const pageNum = Math.max(1, parseInt(String(params.page), 10) || 1);
      const requestedLimit =
        params.pageSize === undefined || params.pageSize === null
          ? defaultLimit
          : parseInt(String(params.pageSize), 10);
      const limit =
        Number.isFinite(requestedLimit) && requestedLimit > 0
          ? Math.min(requestedLimit, maxLimit)
          : defaultLimit;

      const result = await StoreProduct.find(query)
        .select(listSelect)
        .populate({
          path: "category",
          select: ["name", "slug"],
          model: "StoreCategory",
        })
        .populate({
          path: "created.user",
          select: ["name", "lastname"],
          model: "User",
        })
        .limit(limit)
        .skip((pageNum - 1) * limit)
        .sort({ "created.date": -1 });
      const total = await StoreProduct.countDocuments(query);
      const totalPages = Math.ceil(total / limit);
      const next = (): number | null => {
        if (totalPages > pageNum) {
          return pageNum + 1;
        }
        return null;
      };
      return {
        status: 200,
        message: {
          results: result,
          totalProducts: total,
          totalPages,
          currentPage: pageNum,
          pageSize: limit,
          next: next(),
        },
      };
    } catch (e) {
      console.log("[ERROR] -> paginateStoreProducts", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async create(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<StoreProductOutcome> {
    try {
      const doc = new StoreProduct({
        name: data.name,
        slug: data.slug,
        category: data.category,
        status: data.status,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        stock: data.stock,
        sku: data.sku,
        description: data.description,
        featuredImage: data.featuredImage,
        galleryImages: data.galleryImages ?? [],
        isFeatured: data.isFeatured ?? false,
        tags: data.tags ?? [],
        company: companyId,
        created: { user: userId },
      });
      const result = await doc.save();
      return { status: 200, message: result };
    } catch (e) {
      console.log("[ERROR] -> createStoreProduct", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async update(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<StoreProductOutcome> {
    try {
      const found = await StoreProduct.findOne({
        _id: data.id,
        company: companyId,
      });
      if (!found) {
        return { status: 400, message: "Product not found" };
      }
      if (data.name !== undefined) {
        found.name = data.name as string;
      }
      if (data.slug !== undefined) {
        found.slug = data.slug as string;
      }
      if (data.category !== undefined) {
        found.category = data.category as import("mongoose").Types.ObjectId;
      }
      if (data.status !== undefined) {
        found.status = data.status as "activo" | "inactivo" | "agotado";
      }
      if (data.price !== undefined) {
        found.price = data.price as number;
      }
      if (data.compareAtPrice !== undefined) {
        found.compareAtPrice = data.compareAtPrice as number | undefined;
      }
      if (data.clearCompareAtPrice === true) {
        found.compareAtPrice = undefined;
      }
      if (data.stock !== undefined) {
        found.stock = data.stock as number;
      }
      if (data.sku !== undefined) {
        found.sku = data.sku as string;
      }
      if (data.description !== undefined) {
        found.description = data.description as string;
      }
      if (data.featuredImage !== undefined) {
        found.featuredImage = data.featuredImage as string;
      }
      if (data.galleryImages !== undefined) {
        found.galleryImages = data.galleryImages as string[];
      }
      if (data.clearGallery === true) {
        found.galleryImages = [];
      }
      if (data.isFeatured !== undefined) {
        found.isFeatured = Boolean(data.isFeatured);
      }
      if (data.tags !== undefined) {
        found.tags = data.tags as string[];
      }
      found.history = found.history.concat({
        user: editorUserId as unknown as import("mongoose").Types.ObjectId,
        date: new Date(),
      });
      await found.save();
      return { status: 200, message: found };
    } catch (e) {
      console.log("[ERROR] -> updateStoreProduct", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async listPublic(params: {
    search?: string;
    category?: string;
    page?: unknown;
    pageSize?: unknown;
  }): Promise<StoreProductOutcome> {
    try {
      const defaultLimit = 20;
      const maxLimit = 100;
      const searchText =
        params.search !== undefined && params.search !== null
          ? String(params.search).trim()
          : "";

      const query: Record<string, unknown> = {
        active: true,
        status: "activo",
      };

      if (params.category?.trim()) {
        const categoryId = await resolvePublicActiveCategoryId(params.category);
        if (!categoryId) {
          return {
            status: 200,
            message: {
              results: [],
              totalProducts: 0,
              totalPages: 0,
              currentPage: 1,
              pageSize: defaultLimit,
              next: null,
            },
          };
        }
        query.category = categoryId;
      } else {
        const activeCategoryIds = await listPublicActiveCategoryIds();
        if (activeCategoryIds.length === 0) {
          return {
            status: 200,
            message: {
              results: [],
              totalProducts: 0,
              totalPages: 0,
              currentPage: 1,
              pageSize: defaultLimit,
              next: null,
            },
          };
        }
        query.category = { $in: activeCategoryIds };
      }

      if (searchText) {
        const regex = { $regex: escapeRegex(searchText), $options: "i" };
        query.$or = [
          { name: regex },
          { slug: regex },
          { sku: regex },
          { description: regex },
          { tags: regex },
        ];
      }

      const pageNum = Math.max(1, parseInt(String(params.page ?? "1"), 10) || 1);
      const requestedLimit =
        params.pageSize === undefined || params.pageSize === null
          ? defaultLimit
          : parseInt(String(params.pageSize), 10);
      const limit =
        Number.isFinite(requestedLimit) && requestedLimit > 0
          ? Math.min(requestedLimit, maxLimit)
          : defaultLimit;

      const result = await StoreProduct.find(query)
        .select(publicProductSelect)
        .populate(categoryPopulate)
        .limit(limit)
        .skip((pageNum - 1) * limit)
        .sort({ name: 1 })
        .lean();

      const available = result.filter((doc) => isPublicProductAvailable(doc));
      const total = await StoreProduct.countDocuments(query);
      const totalPages = Math.ceil(total / limit);
      const next = (): number | null => {
        if (totalPages > pageNum) {
          return pageNum + 1;
        }
        return null;
      };

      return {
        status: 200,
        message: {
          results: available,
          totalProducts: total,
          totalPages,
          currentPage: pageNum,
          pageSize: limit,
          next: next(),
        },
      };
    } catch (e) {
      console.log("[ERROR] -> listPublicStoreProducts", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async getPublicDetail(id: string): Promise<StoreProductOutcome> {
    try {
      if (!id?.trim()) {
        return { status: 400, message: "Product id is required" };
      }
      const result = await StoreProduct.findOne({
        _id: id,
        active: true,
        status: "activo",
      })
        .select(publicProductSelect)
        .populate(categoryPopulate)
        .lean();
      if (!isPublicProductAvailable(result)) {
        return {
          status: 404,
          message: "Product not found or not available",
        };
      }
      return { status: 200, message: result };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid product id" };
      }
      console.log("[ERROR] -> getPublicStoreProductDetail", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async getPublicDetailBySlug(slug: string): Promise<StoreProductOutcome> {
    try {
      const normalized = slug?.trim().toLowerCase();
      if (!normalized) {
        return { status: 400, message: "Product slug is required" };
      }
      const result = await StoreProduct.findOne({
        slug: normalized,
        active: true,
        status: "activo",
      })
        .select(publicProductSelect)
        .populate(categoryPopulate)
        .lean();
      if (!isPublicProductAvailable(result)) {
        return {
          status: 404,
          message: "Product not found or not available",
        };
      }
      return { status: 200, message: result };
    } catch (e) {
      console.log("[ERROR] -> getPublicStoreProductBySlug", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async softDelete(id: string, companyId: string): Promise<StoreProductOutcome> {
    try {
      const found = await StoreProduct.findOne({
        _id: id,
        company: companyId,
      });
      if (!found) {
        return { status: 400, message: "Product not found" };
      }
      found.active = false;
      await found.save();
      return {
        status: 200,
        message: {
          text: "Product deleted successfully",
          featuredImage: found.featuredImage,
          galleryImages: found.galleryImages,
        },
      };
    } catch (e) {
      console.log("[ERROR] -> deleteStoreProduct", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async findAvailableForOrder(productIds: string[]): Promise<StoreProductOutcome> {
    try {
      const uniqueIds = [...new Set(productIds.map((id) => id.trim()).filter(Boolean))];
      if (uniqueIds.length === 0) {
        return { status: 400, message: "At least one product is required" };
      }
      for (const id of uniqueIds) {
        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
          return { status: 400, message: `Invalid product id: ${id}` };
        }
      }

      const activeCategoryIds = await listPublicActiveCategoryIds();
      if (activeCategoryIds.length === 0) {
        return { status: 400, message: "No active categories available" };
      }

      const products = await StoreProduct.find({
        _id: { $in: uniqueIds },
        active: true,
        status: "activo",
        category: { $in: activeCategoryIds },
      })
        .select("_id name slug sku price stock status")
        .lean();

      return { status: 200, message: products };
    } catch (e) {
      console.log("[ERROR] -> findAvailableForOrder", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async decrementStockForOrder(
    items: { productId: string; quantity: number }[]
  ): Promise<StoreProductOutcome> {
    const decremented: { productId: string; quantity: number }[] = [];
    try {
      for (const item of items) {
        const updated = await StoreProduct.findOneAndUpdate(
          {
            _id: item.productId,
            active: true,
            status: "activo",
            stock: { $gte: item.quantity },
          },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
        if (!updated) {
          if (decremented.length > 0) {
            for (const rollback of decremented) {
              await StoreProduct.updateOne(
                { _id: rollback.productId },
                { $inc: { stock: rollback.quantity } }
              );
            }
          }
          const product = await StoreProduct.findById(item.productId)
            .select("name")
            .lean();
          const label =
            product && typeof product.name === "string"
              ? product.name
              : item.productId;
          return {
            status: 409,
            message: `Insufficient stock for product: ${label}`,
          };
        }
        decremented.push(item);
        if (updated.stock <= 0) {
          updated.status = "agotado";
          await updated.save();
        } else if (updated.status === "agotado") {
          updated.status = "activo";
          await updated.save();
        }
      }
      return { status: 200, message: { ok: true } };
    } catch (e) {
      if (decremented.length > 0) {
        for (const rollback of decremented) {
          await StoreProduct.updateOne(
            { _id: rollback.productId },
            { $inc: { stock: rollback.quantity } }
          );
        }
      }
      console.log("[ERROR] -> decrementStockForOrder", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async restoreStockForOrder(
    items: { productId: string; quantity: number }[]
  ): Promise<StoreProductOutcome> {
    try {
      for (const item of items) {
        const updated = await StoreProduct.findOneAndUpdate(
          { _id: item.productId, active: true },
          { $inc: { stock: item.quantity } },
          { new: true }
        );
        if (updated && updated.stock > 0 && updated.status === "agotado") {
          updated.status = "activo";
          await updated.save();
        }
      }
      return { status: 200, message: { ok: true } };
    } catch (e) {
      console.log("[ERROR] -> restoreStockForOrder", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }
}
