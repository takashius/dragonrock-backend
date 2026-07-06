import StoreCategory from "./mongoose/storeCategoryModel.js";
import StoreProduct from "./mongoose/storeProductModel.js";
import type { StoreCategoryRepository } from "../../application/ports/storeCategoryRepository.js";
import type { StoreCategoryOutcome } from "../../application/types/storeCategoryOutcome.js";
import { publicCategorySelect } from "./storePublicSelects.js";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const listSelect =
  "name slug description featuredImage status created history";

export class MongooseStoreCategoryRepository implements StoreCategoryRepository {
  async listPublic(): Promise<StoreCategoryOutcome> {
    try {
      const result = await StoreCategory.find({
        active: true,
        status: "activa",
      })
        .select(publicCategorySelect)
        .sort({ name: 1 })
        .lean();
      return { status: 200, message: result };
    } catch (e) {
      console.log("[ERROR] -> listPublicStoreCategories", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async listSimple(companyId: string): Promise<StoreCategoryOutcome> {
    try {
      const rows = await StoreCategory.find({
        active: true,
        status: "activa",
        company: companyId,
      })
        .select("name")
        .sort({ name: 1 })
        .lean();
      const result = rows.map((row) => ({
        id: String(row._id),
        name: row.name,
      }));
      return { status: 200, message: result };
    } catch (e) {
      console.log("[ERROR] -> listSimpleStoreCategories", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async getDetail(id: string, companyId: string): Promise<StoreCategoryOutcome> {
    try {
      if (!id?.trim()) {
        return { status: 400, message: "Category id is required" };
      }
      const result = await StoreCategory.findOne({
        _id: id,
        active: true,
        company: companyId,
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
        return { status: 404, message: "Category not found" };
      }
      return { status: 200, message: result };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid category id" };
      }
      console.log("[ERROR] -> getStoreCategoryDetail", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async paginate(params: {
    search?: string;
    filter: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<StoreCategoryOutcome> {
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
        params.status !== undefined &&
        params.status !== null &&
        String(params.status).trim()
      ) {
        query.status = String(params.status).trim();
      }

      if (searchText) {
        const regex = { $regex: escapeRegex(searchText), $options: "i" };
        query.$or = [{ name: regex }, { slug: regex }, { description: regex }];
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

      const rows = await StoreCategory.find(query)
        .select(listSelect)
        .populate({
          path: "created.user",
          select: ["name", "lastname"],
          model: "User",
        })
        .limit(limit)
        .skip((pageNum - 1) * limit)
        .sort({ name: 1 });
      const result = await Promise.all(
        rows.map(async (doc) => ({
          ...doc.toObject(),
          productCount: await StoreProduct.countDocuments({
            active: true,
            company: params.companyId,
            category: doc._id,
          }),
        }))
      );
      const total = await StoreCategory.countDocuments(query);
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
          totalCategories: total,
          totalPages,
          currentPage: pageNum,
          pageSize: limit,
          next: next(),
        },
      };
    } catch (e) {
      console.log("[ERROR] -> paginateStoreCategories", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async create(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<StoreCategoryOutcome> {
    try {
      const doc = new StoreCategory({
        name: data.name,
        slug: data.slug,
        description: data.description,
        featuredImage: data.featuredImage,
        status: data.status ?? "activa",
        company: companyId,
        created: { user: userId },
      });
      const result = await doc.save();
      return { status: 200, message: result };
    } catch (e) {
      console.log("[ERROR] -> createStoreCategory", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async update(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<StoreCategoryOutcome> {
    try {
      const found = await StoreCategory.findOne({
        _id: data.id,
        company: companyId,
      });
      if (!found) {
        return { status: 400, message: "Category not found" };
      }
      if (data.name !== undefined) {
        found.name = data.name as string;
      }
      if (data.slug !== undefined) {
        found.slug = data.slug as string;
      }
      if (data.description !== undefined) {
        found.description = data.description as string;
      }
      if (data.featuredImage !== undefined) {
        found.featuredImage = data.featuredImage as string;
      }
      if (data.status !== undefined) {
        found.status = data.status as "activa" | "inactiva";
      }
      found.history = found.history.concat({
        user: editorUserId as unknown as import("mongoose").Types.ObjectId,
        date: new Date(),
      });
      await found.save();
      return { status: 200, message: found };
    } catch (e) {
      console.log("[ERROR] -> updateStoreCategory", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async softDelete(id: string, companyId: string): Promise<StoreCategoryOutcome> {
    try {
      const found = await StoreCategory.findOne({
        _id: id,
        company: companyId,
      });
      if (!found) {
        return { status: 400, message: "Category not found" };
      }
      found.active = false;
      await found.save();
      return {
        status: 200,
        message: {
          text: "Category deleted successfully",
          featuredImage: found.featuredImage,
        },
      };
    } catch (e) {
      console.log("[ERROR] -> deleteStoreCategory", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }
}
