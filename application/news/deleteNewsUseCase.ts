import type { NewsRepository } from "../ports/newsRepository.js";
import type { NewsOutcome } from "../types/newsOutcome.js";

export class DeleteNewsUseCase {
  constructor(private readonly news: NewsRepository) {}

  async execute(id: string, companyId: string): Promise<NewsOutcome> {
    try {
      return await this.news.softDelete(id, companyId);
    } catch (e: unknown) {
      console.log(e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
