import type { EntrepreneurshipRepository } from "../ports/entrepreneurshipRepository.js";
import type { EntrepreneurshipOutcome } from "../types/entrepreneurshipOutcome.js";

export class DeleteEntrepreneurshipUseCase {
  constructor(private readonly entrepreneurship: EntrepreneurshipRepository) {}

  async execute(id: string, companyId: string): Promise<EntrepreneurshipOutcome> {
    try {
      return await this.entrepreneurship.softDelete(id, companyId);
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
