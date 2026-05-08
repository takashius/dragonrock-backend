import type { NewsRepository } from "../ports/newsRepository.js";
import type { NewsOutcome } from "../types/newsOutcome.js";

export class PaginateNewsUseCase {
  constructor(private readonly news: NewsRepository) {}

  execute(params: {
    filter: unknown;
    page: unknown;
    companyId: string;
  }): Promise<NewsOutcome> {
    return this.news.paginate(params);
  }
}
