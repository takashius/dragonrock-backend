import type { UserRepository } from "../ports/userRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { UserOutcome } from "../types/userOutcome.js";

export class AddUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  async execute(user: Record<string, unknown>): Promise<UserOutcome> {
    try {
      const payload = { ...user };
      const photoRaw = payload.photo;
      if (typeof photoRaw === "string" && photoRaw.trim()) {
        if (!this.mediaStorage) {
          return {
            status: 503,
            message: "Cloudinary no está configurado para foto de usuario",
          };
        }
        const uploaded = await this.mediaStorage.upload({
          source: photoRaw,
          folder: "dragonrock/users",
          resourceType: "image",
        });
        payload.photo = uploaded.secureUrl;
      }
      return await this.users.addUser(payload);
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
