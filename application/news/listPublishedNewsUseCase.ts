import type { NewsRepository } from "../ports/newsRepository.js";
import type { NewsOutcome } from "../types/newsOutcome.js";

export class ListPublishedNewsUseCase {
  constructor(private readonly news: NewsRepository) {}

  execute(): Promise<NewsOutcome> {
    return this.news.listPublished();
  }
}
