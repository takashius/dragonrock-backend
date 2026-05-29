import type { EntrepreneurshipRepository } from "../ports/entrepreneurshipRepository.js";
import type { EntrepreneurshipOutcome } from "../types/entrepreneurshipOutcome.js";

export class GetPublishedEntrepreneurshipDetailUseCase {
  constructor(private readonly entrepreneurship: EntrepreneurshipRepository) {}

  execute(id: string): Promise<EntrepreneurshipOutcome> {
    return this.entrepreneurship.getPublishedDetail(id);
  }
}
