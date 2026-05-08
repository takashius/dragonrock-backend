import type { UserRepository } from "../ports/userRepository.js";

export class LogoutAllUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string): Promise<void> {
    await this.users.logoutAll(id);
  }
}
