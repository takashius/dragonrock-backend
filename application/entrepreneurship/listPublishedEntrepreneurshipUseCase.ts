import type { EntrepreneurshipRepository } from "../ports/entrepreneurshipRepository.js";
import type { EntrepreneurshipOutcome } from "../types/entrepreneurshipOutcome.js";

export class ListPublishedEntrepreneurshipUseCase {
  constructor(private readonly entrepreneurship: EntrepreneurshipRepository) {}

  execute(): Promise<EntrepreneurshipOutcome> {
    return this.entrepreneurship.listPublished();
  }
}
