import News from "./mongoose/newsModel.js";
import type { NewsRepository } from "../../application/ports/newsRepository.js";
import type { NewsOutcome } from "../../application/types/newsOutcome.js";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class MongooseNewsRepository implements NewsRepository {
  async listFirstForCompany(companyId: string): Promise<NewsOutcome> {
    try {
      const query: Record<string, unknown> = {
        active: true,
        company: companyId,
      };
      const result = await News.findOne(query);
      return { status: 200, message: result };
    } catch (e) {
      console.log("[ERROR] -> getNews", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async getDetail(id: string, companyId: string): Promise<NewsOutcome> {
    try {
      if (!id?.trim()) {
        return { status: 400, message: "News id is required" };
      }
      const result = await News.findOne({
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
        return { status: 404, message: "News not found" };
      }
      return { status: 200, message: result };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid news id" };
      }
      console.log("[ERROR] -> getNewsDetail", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async paginate(params: {
    search?: string;
    filter: unknown;
    type?: "escenaRock" | "culturales" | "other";
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<NewsOutcome> {
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
      if (params.type) {
        query.type = params.type;
      }
      if (searchText) {
        query.title = {
          $regex: escapeRegex(searchText),
          $options: "i",
        };
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

      const select =
        "id title description content type status image tags created history";
      const result = await News.find(query)
        .select(select)
        .populate({
          path: "created.user",
          select: ["name", "lastname"],
          model: "User",
        })
        .populate({
          path: "history.user",
          select: ["name", "lastname"],
          model: "User",
        })
        .limit(limit)
        .skip((pageNum - 1) * limit)
        .sort({ "created.date": "desc" });
      const totalNews = await News.countDocuments(query);
      const totalPages = Math.ceil(totalNews / limit);
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
          totalNews,
          totalPages,
          currentPage: pageNum,
          pageSize: limit,
          next: next(),
        },
      };
    } catch (e) {
      console.log("[ERROR] -> getPaginateNews", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async create(
    data: Record<string, unknown>,
    userId: string,
    companyId: string,
  ): Promise<NewsOutcome> {
    try {
      const newsData = {
        title: data.title,
        description: data.description,
        content: data.content,
        type: data.type,
        status: data.status,
        image: data.image,
        tags: data.tags,
        company: companyId,
        created: { user: userId },
      };
      const news = new News(newsData);
      const result = await news.save();
      return { status: 200, message: result };
    } catch (e) {
      console.log("[ERROR] -> addNews", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async update(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string,
  ): Promise<NewsOutcome> {
    try {
      const foundNews = await News.findOne({
        _id: data.id,
        company: companyId,
      });
      if (!foundNews) {
        return { status: 400, message: "News not found" };
      }
      if (data.title) {
        foundNews.title = data.title as string;
      }
      if (data.description) {
        foundNews.description = data.description as string;
      }
      if (data.content) {
        foundNews.content = data.content as string;
      }
      if (data.type) {
        foundNews.type = data.type as "escenaRock" | "culturales" | "other";
      }
      if (data.status) {
        foundNews.status = data.status as "draft" | "published" | "archived";
      }
      if (data.image) {
        foundNews.image = data.image as string;
      }
      if (data.tags) {
        foundNews.tags = data.tags as string[];
      }
      foundNews.history = foundNews.history.concat({
        user: editorUserId as unknown as import("mongoose").Types.ObjectId,
        date: new Date(),
      });
      await foundNews.save();
      return { status: 200, message: foundNews };
    } catch (e) {
      console.log("[ERROR] -> updateNews", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async softDelete(id: string, companyId: string): Promise<NewsOutcome> {
    try {
      const foundNews = await News.findOne({ _id: id, company: companyId });
      if (!foundNews) {
        return { status: 400, message: "News not found" };
      }
      foundNews.active = false;
      await foundNews.save();
      return { status: 200, message: "News deleted successfully" };
    } catch (e) {
      console.log("[ERROR] -> deleteNews", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }
}
