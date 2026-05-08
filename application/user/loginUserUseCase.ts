import type { UserRepository } from "../ports/userRepository.js";
import type { UserOutcome } from "../types/userOutcome.js";

export class LoginUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(credentials: {
    email: string;
    password: string;
  }): Promise<UserOutcome> {
    try {
      const { email, password } = credentials;
      return await this.users.loginUser(email, password);
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
