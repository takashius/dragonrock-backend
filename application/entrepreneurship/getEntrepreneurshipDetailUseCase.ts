import type { EntrepreneurshipRepository } from "../ports/entrepreneurshipRepository.js";
import type { EntrepreneurshipOutcome } from "../types/entrepreneurshipOutcome.js";

export class GetEntrepreneurshipDetailUseCase {
  constructor(private readonly entrepreneurship: EntrepreneurshipRepository) {}

  execute(id: string, companyId: string): Promise<EntrepreneurshipOutcome> {
    return this.entrepreneurship.getDetail(id, companyId);
  }
}
