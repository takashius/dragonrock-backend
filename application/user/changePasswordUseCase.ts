import type { UserRepository } from "../ports/userRepository.js";
import type { UserOutcome } from "../types/userOutcome.js";
import type { AuthUserPayload } from "../../types/auth.js";

export class ChangePasswordUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(
    user: AuthUserPayload,
    newPass: string
  ): Promise<UserOutcome> {
    try {
      if (!user || !newPass) {
        return {
          status: 400,
          message: "User or Password not received",
        };
      }
      return await this.users.changePassword(
        { email: user.email },
        newPass
      );
    } catch (e: unknown) {
      return {
        status: 500,
        message: "Unexpected error",
        detail: e,
      };
    }
  }
}
