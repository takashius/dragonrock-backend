import type { NewsCommentRepository } from "../ports/newsCommentRepository.js";
import type { NewsCommentOutcome } from "../types/newsCommentOutcome.js";

export class DeleteNewsCommentUseCase {
  constructor(private readonly comments: NewsCommentRepository) {}

  async execute(
    commentId: string,
    companyId: string,
    actorRole?: string
  ): Promise<NewsCommentOutcome> {
    try {
      if (actorRole !== "Administrador") {
        return {
          status: 403,
          message: { error: "Only administrators can delete comments" },
        };
      }
      return await this.comments.softDelete(commentId, companyId);
    } catch (e: unknown) {
      console.log("[ERROR] -> deleteNewsComment", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
