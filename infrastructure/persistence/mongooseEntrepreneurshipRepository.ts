import Entrepreneurship from "./mongoose/entrepreneurshipModel.js";
import type { EntrepreneurshipRepository } from "../../application/ports/entrepreneurshipRepository.js";
import type { EntrepreneurshipOutcome } from "../../application/types/entrepreneurshipOutcome.js";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const listSelect =
  "entrepreneurName businessName role category location website status isFeatured featuredImage featuredQuote introduction questions keyLearnings created history";
const publicListSelect =
  "entrepreneurName businessName role category location website status isFeatured featuredImage featuredQuote introduction questions keyLearnings created";

export class MongooseEntrepreneurshipRepository
  implements EntrepreneurshipRepository
{
  async listPublished(): Promise<EntrepreneurshipOutcome> {
    try {
      const result = await Entrepreneurship.find({
        active: true,
        status: "published",
      })
        .select(publicListSelect)
        .populate({
          path: "created.user",
          select: ["name", "lastname"],
          model: "User",
        })
        .sort({ "created.date": "desc" });
      return { status: 200, message: result };
    } catch (e) {
      console.log("[ERROR] -> listPublishedEntrepreneurship", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async getPublishedDetail(id: string): Promise<EntrepreneurshipOutcome> {
    try {
      if (!id?.trim()) {
        return { status: 400, message: "Entrepreneurship id is required" };
      }
      const result = await Entrepreneurship.findOne({
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
          message: "Interview not found or not published",
        };
      }
      return { status: 200, message: result };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid entrepreneurship id" };
      }
      console.log("[ERROR] -> getPublishedEntrepreneurshipDetail", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async getDetail(id: string, companyId: string): Promise<EntrepreneurshipOutcome> {
    try {
      if (!id?.trim()) {
        return { status: 400, message: "Entrepreneurship id is required" };
      }
      const result = await Entrepreneurship.findOne({
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
        return { status: 404, message: "Interview not found" };
      }
      return { status: 200, message: result };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid entrepreneurship id" };
      }
      console.log("[ERROR] -> getEntrepreneurshipDetail", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async paginate(params: {
    search?: string;
    filter: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<EntrepreneurshipOutcome> {
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
      if (searchText) {
        const regex = { $regex: escapeRegex(searchText), $options: "i" };
        query.$or = [
          { entrepreneurName: regex },
          { businessName: regex },
          { category: regex },
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

      const result = await Entrepreneurship.find(query)
        .select(listSelect)
        .populate({
          path: "created.user",
          select: ["name", "lastname"],
          model: "User",
        })
        .limit(limit)
        .skip((pageNum - 1) * limit)
        .sort({ "created.date": "desc" });
      const total = await Entrepreneurship.countDocuments(query);
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
          totalEntrepreneurships: total,
          totalPages,
          currentPage: pageNum,
          pageSize: limit,
          next: next(),
        },
      };
    } catch (e) {
      console.log("[ERROR] -> paginateEntrepreneurship", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async create(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<EntrepreneurshipOutcome> {
    try {
      const doc = new Entrepreneurship({
        entrepreneurName: data.entrepreneurName,
        businessName: data.businessName,
        role: data.role,
        category: data.category,
        location: data.location,
        website: data.website,
        status: data.status,
        isFeatured: data.isFeatured ?? false,
        featuredImage: data.featuredImage,
        featuredQuote: data.featuredQuote,
        introduction: data.introduction,
        questions: data.questions,
        keyLearnings: data.keyLearnings ?? [],
        company: companyId,
        created: { user: userId },
      });
      const result = await doc.save();
      return { status: 200, message: result };
    } catch (e) {
      console.log("[ERROR] -> createEntrepreneurship", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async update(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<EntrepreneurshipOutcome> {
    try {
      const found = await Entrepreneurship.findOne({
        _id: data.id,
        company: companyId,
      });
      if (!found) {
        return { status: 400, message: "Interview not found" };
      }
      if (data.entrepreneurName !== undefined) {
        found.entrepreneurName = data.entrepreneurName as string;
      }
      if (data.businessName !== undefined) {
        found.businessName = data.businessName as string;
      }
      if (data.role !== undefined) {
        found.role = data.role as string;
      }
      if (data.category !== undefined) {
        found.category = data.category as string;
      }
      if (data.location !== undefined) {
        found.location = data.location as string;
      }
      if (data.website !== undefined) {
        found.website = data.website as string;
      }
      if (data.status !== undefined) {
        found.status = data.status as "draft" | "published";
      }
      if (data.isFeatured !== undefined) {
        found.isFeatured = Boolean(data.isFeatured);
      }
      if (data.featuredImage !== undefined) {
        found.featuredImage = data.featuredImage as string;
      }
      if (data.featuredQuote !== undefined) {
        found.featuredQuote = data.featuredQuote as string;
      }
      if (data.introduction !== undefined) {
        found.introduction = data.introduction as string;
      }
      if (data.questions !== undefined) {
        found.set(
          "questions",
          data.questions as { question: string; answer: string }[]
        );
      }
      if (data.keyLearnings !== undefined) {
        found.keyLearnings = data.keyLearnings as string[];
      }
      found.history = found.history.concat({
        user: editorUserId as unknown as import("mongoose").Types.ObjectId,
        date: new Date(),
      });
      await found.save();
      return { status: 200, message: found };
    } catch (e) {
      console.log("[ERROR] -> updateEntrepreneurship", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async softDelete(id: string, companyId: string): Promise<EntrepreneurshipOutcome> {
    try {
      const found = await Entrepreneurship.findOne({
        _id: id,
        company: companyId,
      });
      if (!found) {
        return { status: 400, message: "Interview not found" };
      }
      found.active = false;
      await found.save();
      return { status: 200, message: "Interview deleted successfully" };
    } catch (e) {
      console.log("[ERROR] -> deleteEntrepreneurship", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }
}
