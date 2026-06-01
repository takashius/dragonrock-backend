import type { PublicHomeRepository } from "../ports/publicHomeRepository.js";
import type { PublicHomeOutcome } from "../types/publicHomeOutcome.js";

export class GetPublicHomeUseCase {
  constructor(private readonly publicHome: PublicHomeRepository) {}

  execute(): Promise<PublicHomeOutcome> {
    return this.publicHome.getHome();
  }
}
