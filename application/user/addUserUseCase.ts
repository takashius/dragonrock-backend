import type { UserRepository } from "../ports/userRepository.js";
import type { UserOutcome } from "../types/userOutcome.js";

export class AddUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(user: Record<string, unknown>): Promise<UserOutcome> {
    try {
      return await this.users.addUser(user);
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
