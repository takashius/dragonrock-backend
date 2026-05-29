import type { MultimediaRepository } from "../ports/multimediaRepository.js";
import type { MultimediaOutcome } from "../types/multimediaOutcome.js";

export class GetMultimediaDetailUseCase {
  constructor(private readonly multimedia: MultimediaRepository) {}

  execute(id: string, companyId: string): Promise<MultimediaOutcome> {
    return this.multimedia.getDetail(id, companyId);
  }
}
