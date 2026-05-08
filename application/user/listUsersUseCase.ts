import type { UserRepository } from "../ports/userRepository.js";
import type { UserOutcome } from "../types/userOutcome.js";

export class ListUsersUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(): Promise<UserOutcome> {
    try {
      return await this.users.getUsers(null);
    } catch (e: unknown) {
      console.log(e);
      return {
        status: 500,
        message: "Unexpected error",
        detail: e,
      };
    }
  }
}
