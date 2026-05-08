import type { NewsRepository } from "../ports/newsRepository.js";
import type { NewsOutcome } from "../types/newsOutcome.js";

export class ListNewsUseCase {
  constructor(private readonly news: NewsRepository) {}

  execute(companyId: string): Promise<NewsOutcome> {
    return this.news.listFirstForCompany(companyId);
  }
}
