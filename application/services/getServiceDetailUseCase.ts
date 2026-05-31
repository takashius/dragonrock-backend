import type { ServiceRepository } from "../ports/serviceRepository.js";
import type { ServiceOutcome } from "../types/serviceOutcome.js";

export class GetServiceDetailUseCase {
  constructor(private readonly services: ServiceRepository) {}

  execute(id: string, companyId: string): Promise<ServiceOutcome> {
    return this.services.getDetail(id, companyId);
  }
}
