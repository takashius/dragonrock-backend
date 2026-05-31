import type { ServiceRepository } from "../ports/serviceRepository.js";
import type { ServiceOutcome } from "../types/serviceOutcome.js";

export class GetPublishedServiceDetailUseCase {
  constructor(private readonly services: ServiceRepository) {}

  execute(id: string): Promise<ServiceOutcome> {
    return this.services.getPublishedDetail(id);
  }
}
