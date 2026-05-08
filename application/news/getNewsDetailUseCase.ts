import type { NewsRepository } from "../ports/newsRepository.js";
import type { NewsOutcome } from "../types/newsOutcome.js";

export class GetNewsDetailUseCase {
  constructor(private readonly news: NewsRepository) {}

  execute(id: string, companyId: string): Promise<NewsOutcome> {
    return this.news.getDetail(id, companyId);
  }
}
