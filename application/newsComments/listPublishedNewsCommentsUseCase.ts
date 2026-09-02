import type { NewsRepository } from "../ports/newsRepository.js";
import type { NewsCommentRepository } from "../ports/newsCommentRepository.js";
import type { NewsCommentOutcome } from "../types/newsCommentOutcome.js";

export class ListPublishedNewsCommentsUseCase {
  constructor(
    private readonly news: NewsRepository,
    private readonly comments: NewsCommentRepository
  ) {}

  async execute(newsId: string): Promise<NewsCommentOutcome> {
    try {
      const published = await this.news.getPublishedDetail(newsId);
      if (published.status !== 200) {
        return {
          status: published.status,
          message: published.message,
          detail: published.detail,
        };
      }
      return await this.comments.listPublishedByNews(newsId);
    } catch (e: unknown) {
      console.log("[ERROR] -> listPublishedNewsComments", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
