import type { NewsRepository } from "../ports/newsRepository.js";
import type { NewsOutcome } from "../types/newsOutcome.js";

export class CreateNewsUseCase {
  constructor(private readonly news: NewsRepository) {}

  execute(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<NewsOutcome> {
    return this.news.create(data, userId, companyId);
  }
}
