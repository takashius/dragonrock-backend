import type {
  NewsCommentOutcome,
  PublicNewsCommentDto,
} from "../types/newsCommentOutcome.js";

export type CreateNewsCommentRecord = {
  newsId: string;
  authorName: string;
  body: string;
};

/**
 * Puerto de persistencia de comentarios de noticias.
 */
export interface NewsCommentRepository {
  listPublishedByNews(newsId: string): Promise<NewsCommentOutcome>;
  create(record: CreateNewsCommentRecord): Promise<NewsCommentOutcome>;
  softDelete(commentId: string, companyId: string): Promise<NewsCommentOutcome>;
}

export type { PublicNewsCommentDto };
