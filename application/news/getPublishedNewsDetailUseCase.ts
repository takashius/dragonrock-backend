import type { NewsRepository } from "../ports/newsRepository.js";
import type { NewsOutcome } from "../types/newsOutcome.js";

export class GetPublishedNewsDetailUseCase {
  constructor(private readonly news: NewsRepository) {}

  execute(id: string): Promise<NewsOutcome> {
    return this.news.getPublishedDetail(id);
  }
}
