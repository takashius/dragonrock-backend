import type { UserRepository } from "../ports/userRepository.js";
import type { UserOutcome } from "../types/userOutcome.js";

export class AddCompanyUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(
    userId: string,
    company: string
  ): Promise<UserOutcome> {
    try {
      return await this.users.addCompany(userId, company);
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
