import type { ServiceRepository } from "../ports/serviceRepository.js";
import type { ServiceOutcome } from "../types/serviceOutcome.js";

export class PaginateServicesUseCase {
  constructor(private readonly services: ServiceRepository) {}

  execute(params: {
    search?: string;
    filter: unknown;
    category?: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<ServiceOutcome> {
    return this.services.paginate(params);
  }
}
