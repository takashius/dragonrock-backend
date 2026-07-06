import type { StoreCategoryRepository } from "../ports/storeCategoryRepository.js";
import type { StoreCategoryOutcome } from "../types/storeCategoryOutcome.js";

export class ListPublicStoreCategoriesUseCase {
  constructor(private readonly categories: StoreCategoryRepository) {}

  execute(): Promise<StoreCategoryOutcome> {
    return this.categories.listPublic();
  }
}
