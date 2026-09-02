import NewsComment from "./mongoose/newsCommentModel.js";
import News from "./mongoose/newsModel.js";
import type {
  CreateNewsCommentRecord,
  NewsCommentRepository,
} from "../../application/ports/newsCommentRepository.js";
import type { NewsCommentOutcome } from "../../application/types/newsCommentOutcome.js";
import { mapNewsCommentDto } from "../../application/newsComments/mapNewsCommentDto.js";

export class MongooseNewsCommentRepository implements NewsCommentRepository {
  async listPublishedByNews(newsId: string): Promise<NewsCommentOutcome> {
    try {
      const result = await NewsComment.find({
        news: newsId,
        active: true,
      })
        .select("_id authorName body createdAt")
        .sort({ createdAt: -1 })
        .lean();
      return {
        status: 200,
        message: result.map(mapNewsCommentDto),
      };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid news id" };
      }
      console.log("[ERROR] -> listPublishedNewsComments", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async create(record: CreateNewsCommentRecord): Promise<NewsCommentOutcome> {
    try {
      const comment = new NewsComment({
        news: record.newsId,
        authorName: record.authorName,
        body: record.body,
      });
      const saved = await comment.save();
      const savedWithTimestamps = saved as typeof saved & { createdAt?: Date };
      return {
        status: 200,
        message: mapNewsCommentDto({
          _id: saved._id,
          authorName: saved.authorName,
          body: saved.body,
          createdAt: savedWithTimestamps.createdAt,
        }),
      };
    } catch (e: unknown) {
      console.log("[ERROR] -> createNewsComment", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async softDelete(
    commentId: string,
    companyId: string
  ): Promise<NewsCommentOutcome> {
    try {
      const found = await NewsComment.findOne({
        _id: commentId,
        active: true,
      });
      if (!found) {
        return { status: 404, message: "Comment not found" };
      }

      const news = await News.findById(found.news).select("company");
      if (!news || String(news.company) !== companyId) {
        return { status: 404, message: "Comment not found" };
      }

      found.active = false;
      await found.save();
      return { status: 200, message: "Comment deleted successfully" };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid comment id" };
      }
      console.log("[ERROR] -> deleteNewsComment", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }
}
