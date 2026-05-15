import type { UserRepository } from "../ports/userRepository.js";
import type { MediaStorage } from "../ports/mediaStorage.js";
import type { UserOutcome } from "../types/userOutcome.js";

export class UpdateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly mediaStorage?: MediaStorage
  ) {}

  async execute(user: {
    id: string;
    name?: string;
    lastname?: string;
    role?: "Administrador" | "Editor" | "Autor";
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
      const payload = { ...user };
      const nextPhotoRaw = payload.photo;
      const shouldReplacePhoto =
        typeof nextPhotoRaw === "string" && nextPhotoRaw.trim().length > 0;

      let previousPhoto: string | undefined;
      if (shouldReplacePhoto) {
        if (!this.mediaStorage) {
          return {
            status: 503,
            message: "Cloudinary no está configurado para foto de usuario",
          };
        }

        const existingUser = await this.users.getUser(user.id);
        if (
          existingUser.status === 200 &&
          existingUser.message &&
          typeof existingUser.message === "object" &&
          "photo" in existingUser.message
        ) {
          const maybePhoto = (existingUser.message as { photo?: unknown }).photo;
          if (typeof maybePhoto === "string" && maybePhoto.trim()) {
            previousPhoto = maybePhoto;
          }
        }

        const uploaded = await this.mediaStorage.upload({
          source: nextPhotoRaw,
          folder: "dragonrock/users",
          resourceType: "image",
        });
        payload.photo = uploaded.secureUrl;
      }

      const updated = await this.users.updateUser(payload);

      if (
        updated.status === 200 &&
        shouldReplacePhoto &&
        previousPhoto &&
        previousPhoto !== payload.photo &&
        this.mediaStorage?.destroyByUrl
      ) {
        try {
          await this.mediaStorage.destroyByUrl(previousPhoto);
        } catch (cleanupError: unknown) {
          console.log("[user] no se pudo borrar foto previa", cleanupError);
        }
      }

      return updated;
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
