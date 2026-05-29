import type { MultimediaRepository } from "../ports/multimediaRepository.js";
import type { MultimediaOutcome } from "../types/multimediaOutcome.js";

export class ListPublishedMultimediaUseCase {
  constructor(private readonly multimedia: MultimediaRepository) {}

  execute(): Promise<MultimediaOutcome> {
    return this.multimedia.listPublished();
  }
}
