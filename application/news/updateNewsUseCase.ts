import type { NewsRepository } from "../ports/newsRepository.js";
import type { NewsOutcome } from "../types/newsOutcome.js";

export class UpdateNewsUseCase {
  constructor(private readonly news: NewsRepository) {}

  execute(
    data: { id: string } & Record<string, unknown>,
    companyId: string
  ): Promise<NewsOutcome> {
    return this.news.update(data, companyId);
  }
}
