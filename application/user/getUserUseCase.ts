import type { UserRepository } from "../ports/userRepository.js";
import type { UserOutcome } from "../types/userOutcome.js";

export class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string | null): Promise<UserOutcome> {
    try {
      if (!id) {
        return {
          status: 400,
          message: "User ID is required",
        };
      }
      return await this.users.getUser(id);
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
