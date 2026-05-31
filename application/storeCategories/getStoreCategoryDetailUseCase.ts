import type { StoreCategoryRepository } from "../ports/storeCategoryRepository.js";
import type { StoreCategoryOutcome } from "../types/storeCategoryOutcome.js";

export class GetStoreCategoryDetailUseCase {
  constructor(private readonly categories: StoreCategoryRepository) {}

  execute(id: string, companyId: string): Promise<StoreCategoryOutcome> {
    return this.categories.getDetail(id, companyId);
  }
}
