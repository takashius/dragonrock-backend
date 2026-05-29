import type { MultimediaRepository } from "../ports/multimediaRepository.js";
import type { MultimediaOutcome } from "../types/multimediaOutcome.js";

export class GetPublishedMultimediaDetailUseCase {
  constructor(private readonly multimedia: MultimediaRepository) {}

  execute(id: string): Promise<MultimediaOutcome> {
    return this.multimedia.getPublishedDetail(id);
  }
}
