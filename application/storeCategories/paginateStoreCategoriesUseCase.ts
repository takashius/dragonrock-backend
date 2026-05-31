import type { StoreCategoryRepository } from "../ports/storeCategoryRepository.js";
import type { StoreCategoryOutcome } from "../types/storeCategoryOutcome.js";

export class PaginateStoreCategoriesUseCase {
  constructor(private readonly categories: StoreCategoryRepository) {}

  execute(params: {
    search?: string;
    filter: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<StoreCategoryOutcome> {
    return this.categories.paginate(params);
  }
}
