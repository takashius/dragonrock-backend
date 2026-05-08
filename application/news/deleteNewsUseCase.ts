import type { NewsRepository } from "../ports/newsRepository.js";
import type { NewsOutcome } from "../types/newsOutcome.js";

export class DeleteNewsUseCase {
  constructor(private readonly news: NewsRepository) {}

  execute(id: string, companyId: string): Promise<NewsOutcome> {
    return this.news.softDelete(id, companyId);
  }
}
