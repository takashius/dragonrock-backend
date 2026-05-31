import Service from "./mongoose/serviceModel.js";
import type { ServiceRepository } from "../../application/ports/serviceRepository.js";
import type { ServiceOutcome } from "../../application/types/serviceOutcome.js";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const listSelect =
  "name slug category status price showPriceFrom shortDescription fullDescription featuredImage contactUrl tags isFeatured created history";
const publicListSelect =
  "name slug category status price showPriceFrom shortDescription fullDescription featuredImage contactUrl tags isFeatured created";

export class MongooseServiceRepository implements ServiceRepository {
  async listPublished(): Promise<ServiceOutcome> {
    try {
      const result = await Service.find({
        active: true,
        status: "published",
      })
        .select(publicListSelect)
        .populate({
          path: "created.user",
          select: ["name", "lastname"],
          model: "User",
        })
        .sort({ "created.date": -1 });
      return { status: 200, message: result };
    } catch (e) {
      console.log("[ERROR] -> listPublishedServices", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async getPublishedDetail(id: string): Promise<ServiceOutcome> {
    try {
      if (!id?.trim()) {
        return { status: 400, message: "Service id is required" };
      }
      const result = await Service.findOne({
        _id: id,
        active: true,
        status: "published",
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
        return {
          status: 404,
          message: "Service not found or not published",
        };
      }
      return { status: 200, message: result };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid service id" };
      }
      console.log("[ERROR] -> getPublishedServiceDetail", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async getDetail(id: string, companyId: string): Promise<ServiceOutcome> {
    try {
      if (!id?.trim()) {
        return { status: 400, message: "Service id is required" };
      }
      const result = await Service.findOne({
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
        return { status: 404, message: "Service not found" };
      }
      return { status: 200, message: result };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid service id" };
      }
      console.log("[ERROR] -> getServiceDetail", e);
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
  }): Promise<ServiceOutcome> {
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
          { shortDescription: regex },
          { fullDescription: regex },
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

      const result = await Service.find(query)
        .select(listSelect)
        .populate({
          path: "created.user",
          select: ["name", "lastname"],
          model: "User",
        })
        .limit(limit)
        .skip((pageNum - 1) * limit)
        .sort({ "created.date": -1 });
      const total = await Service.countDocuments(query);
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
          totalServices: total,
          totalPages,
          currentPage: pageNum,
          pageSize: limit,
          next: next(),
        },
      };
    } catch (e) {
      console.log("[ERROR] -> paginateServices", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async create(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<ServiceOutcome> {
    try {
      const doc = new Service({
        name: data.name,
        slug: data.slug,
        category: data.category,
        status: data.status,
        price: data.price,
        showPriceFrom: data.showPriceFrom ?? false,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        featuredImage: data.featuredImage,
        contactUrl: data.contactUrl,
        tags: data.tags ?? [],
        isFeatured: data.isFeatured ?? false,
        company: companyId,
        created: { user: userId },
      });
      const result = await doc.save();
      return { status: 200, message: result };
    } catch (e) {
      console.log("[ERROR] -> createService", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async update(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<ServiceOutcome> {
    try {
      const found = await Service.findOne({
        _id: data.id,
        company: companyId,
      });
      if (!found) {
        return { status: 400, message: "Service not found" };
      }
      if (data.name !== undefined) {
        found.name = data.name as string;
      }
      if (data.slug !== undefined) {
        found.slug = data.slug as string;
      }
      if (data.category !== undefined) {
        found.category = data.category as
          | "desarrolloWeb"
          | "disenoGrafico"
          | "marketingDigital"
          | "personalizacion"
          | "produccionMusical"
          | "fotografia"
          | "otro";
      }
      if (data.status !== undefined) {
        found.status = data.status as "draft" | "published";
      }
      if (data.price !== undefined) {
        found.price = data.price as number | undefined;
      }
      if (data.clearPrice === true) {
        found.price = undefined;
      }
      if (data.showPriceFrom !== undefined) {
        found.showPriceFrom = Boolean(data.showPriceFrom);
      }
      if (data.shortDescription !== undefined) {
        found.shortDescription = data.shortDescription as string;
      }
      if (data.fullDescription !== undefined) {
        found.fullDescription = data.fullDescription as string;
      }
      if (data.featuredImage !== undefined) {
        found.featuredImage = data.featuredImage as string;
      }
      if (data.contactUrl !== undefined) {
        found.contactUrl = data.contactUrl as string;
      }
      if (data.tags !== undefined) {
        found.tags = data.tags as string[];
      }
      if (data.isFeatured !== undefined) {
        found.isFeatured = Boolean(data.isFeatured);
      }
      found.history = found.history.concat({
        user: editorUserId as unknown as import("mongoose").Types.ObjectId,
        date: new Date(),
      });
      await found.save();
      return { status: 200, message: found };
    } catch (e) {
      console.log("[ERROR] -> updateService", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async softDelete(id: string, companyId: string): Promise<ServiceOutcome> {
    try {
      const found = await Service.findOne({
        _id: id,
        company: companyId,
      });
      if (!found) {
        return { status: 400, message: "Service not found" };
      }
      found.active = false;
      await found.save();
      return {
        status: 200,
        message: {
          text: "Service deleted successfully",
          featuredImage: found.featuredImage,
        },
      };
    } catch (e) {
      console.log("[ERROR] -> deleteService", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }
}
