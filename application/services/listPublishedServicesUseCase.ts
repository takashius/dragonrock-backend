import type { ServiceRepository } from "../ports/serviceRepository.js";
import type { ServiceOutcome } from "../types/serviceOutcome.js";

export class ListPublishedServicesUseCase {
  constructor(private readonly services: ServiceRepository) {}

  execute(): Promise<ServiceOutcome> {
    return this.services.listPublished();
  }
}
