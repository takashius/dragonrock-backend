import type { EntrepreneurshipRepository } from "../ports/entrepreneurshipRepository.js";
import type { EntrepreneurshipOutcome } from "../types/entrepreneurshipOutcome.js";

export class PaginateEntrepreneurshipUseCase {
  constructor(private readonly entrepreneurship: EntrepreneurshipRepository) {}

  execute(params: {
    search?: string;
    filter: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<EntrepreneurshipOutcome> {
    return this.entrepreneurship.paginate(params);
  }
}
