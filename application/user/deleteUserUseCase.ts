import type { UserRepository } from "../ports/userRepository.js";
import type { UserOutcome } from "../types/userOutcome.js";

export class DeleteUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string): Promise<UserOutcome> {
    try {
      return await this.users.deleteUser(id);
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
