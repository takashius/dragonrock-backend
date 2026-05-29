import type { MultimediaRepository } from "../ports/multimediaRepository.js";
import type { MultimediaOutcome } from "../types/multimediaOutcome.js";

export class PaginateMultimediaUseCase {
  constructor(private readonly multimedia: MultimediaRepository) {}

  execute(params: {
    search?: string;
    filter: unknown;
    type?: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<MultimediaOutcome> {
    return this.multimedia.paginate(params);
  }
}
