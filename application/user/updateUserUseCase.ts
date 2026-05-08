import type { UserRepository } from "../ports/userRepository.js";
import type { UserOutcome } from "../types/userOutcome.js";

export class UpdateUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(user: {
    id: string;
    name?: string;
    lastname?: string;
    photo?: string;
    phone?: string;
    password?: string;
  }): Promise<UserOutcome> {
    try {
      if (!user.id) {
        return {
          status: 400,
          message: "No user ID recived",
        };
      }
      return await this.users.updateUser(user);
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
