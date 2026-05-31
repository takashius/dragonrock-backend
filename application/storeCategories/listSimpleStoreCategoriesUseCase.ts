import type { StoreCategoryRepository } from "../ports/storeCategoryRepository.js";
import type { StoreCategoryOutcome } from "../types/storeCategoryOutcome.js";

export class ListSimpleStoreCategoriesUseCase {
  constructor(private readonly categories: StoreCategoryRepository) {}

  execute(companyId: string): Promise<StoreCategoryOutcome> {
    return this.categories.listSimple(companyId);
  }
}
