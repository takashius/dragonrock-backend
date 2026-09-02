import type { CaptchaVerifier } from "../ports/captchaVerifier.js";
import type { NewsRepository } from "../ports/newsRepository.js";
import type { NewsCommentRepository } from "../ports/newsCommentRepository.js";
import type {
  CreatePublicNewsCommentInput,
  NewsCommentOutcome,
} from "../types/newsCommentOutcome.js";
import { sanitizeNewsCommentText } from "./sanitizeNewsCommentText.js";

export class CreatePublicNewsCommentUseCase {
  constructor(
    private readonly news: NewsRepository,
    private readonly comments: NewsCommentRepository,
    private readonly captcha: CaptchaVerifier | undefined,
    private readonly captchaRequired: boolean
  ) {}

  async execute(
    payload: CreatePublicNewsCommentInput
  ): Promise<NewsCommentOutcome> {
    try {
      if (this.captchaRequired) {
        const token = payload.captchaToken?.trim() ?? "";
        if (!token) {
          return { status: 400, message: "Captcha is required" };
        }
        if (!this.captcha) {
          return { status: 503, message: "Captcha is not configured" };
        }
        const verified = await this.captcha.verify(token, payload.remoteIp);
        if (!verified.ok) {
          return { status: 400, message: verified.message };
        }
      }

      const authorName = sanitizeNewsCommentText(payload.name);
      const body = sanitizeNewsCommentText(payload.body);
      if (authorName.length < 2) {
        return { status: 400, message: "A display name is required" };
      }
      if (body.length < 1) {
        return { status: 400, message: "Comment body is required" };
      }

      const published = await this.news.getPublishedDetail(payload.newsId);
      if (published.status !== 200) {
        return {
          status: published.status,
          message: published.message,
          detail: published.detail,
        };
      }

      return await this.comments.create({
        newsId: payload.newsId,
        authorName,
        body,
      });
    } catch (e: unknown) {
      console.log("[ERROR] -> createPublicNewsComment", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
