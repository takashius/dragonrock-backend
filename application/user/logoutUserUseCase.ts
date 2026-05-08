import type { UserRepository } from "../ports/userRepository.js";

export class LogoutUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string, token: string): Promise<void> {
    await this.users.logoutUser(id, token);
  }
}
