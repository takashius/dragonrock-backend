import test from "node:test";
import assert from "node:assert/strict";
import type { UserRepository } from "../../../application/ports/userRepository.js";
import type { MediaStorage } from "../../../application/ports/mediaStorage.js";
import { AddUserUseCase } from "../../../application/user/addUserUseCase.js";
import { UpdateUserUseCase } from "../../../application/user/updateUserUseCase.js";

test("AddUserUseCase: sube foto y guarda URL", async () => {
  let storedPayload: Record<string, unknown> | undefined;
  const users = {
    async addUser(payload: Record<string, unknown>) {
      storedPayload = payload;
      return { status: 201, message: payload };
    },
  } as UserRepository;
  const media = {
    async upload() {
      return {
        publicId: "dragonrock/users/u1",
        secureUrl: "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/users/u1.jpg",
        resourceType: "image",
      };
    },
  } as MediaStorage;

  const out = await new AddUserUseCase(users, media).execute({
    name: "Ana",
    email: "ana@example.com",
    password: "password123",
    photo: "data:image/png;base64,AAAA",
  });

  assert.equal(out.status, 201);
  assert.equal(
    storedPayload?.photo,
    "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/users/u1.jpg"
  );
});

test("AddUserUseCase: si hay foto y no cloudinary configurado retorna 503", async () => {
  const out = await new AddUserUseCase({} as UserRepository).execute({
    photo: "data:image/png;base64,AAAA",
  });
  assert.equal(out.status, 503);
});

test("UpdateUserUseCase: sube nueva foto y elimina previa", async () => {
  let deletedUrl = "";
  let updatePayload: unknown;
  const users = {
    async getUser() {
      return {
        status: 200,
        message: {
          photo:
            "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/users/old.jpg",
        },
      };
    },
    async updateUser(payload: unknown) {
      updatePayload = payload;
      return { status: 200, message: "ok" };
    },
  } as UserRepository;
  const media = {
    async upload() {
      return {
        publicId: "dragonrock/users/new",
        secureUrl: "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/users/new.jpg",
        resourceType: "image",
      };
    },
    async destroyByUrl(url: string) {
      deletedUrl = url;
      return { publicId: "dragonrock/users/old", result: "ok" };
    },
  } as MediaStorage;

  const out = await new UpdateUserUseCase(users, media).execute({
    id: "507f1f77bcf86cd799439011",
    photo: "data:image/png;base64,BBBB",
  });

  assert.equal(out.status, 200);
  assert.equal(
    (updatePayload as { photo?: string }).photo,
    "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/users/new.jpg"
  );
  assert.equal(
    deletedUrl,
    "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/users/old.jpg"
  );
});

test("UpdateUserUseCase: si hay foto y no cloudinary configurado retorna 503", async () => {
  const out = await new UpdateUserUseCase({} as UserRepository).execute({
    id: "507f1f77bcf86cd799439011",
    photo: "data:image/png;base64,CCCC",
  });
  assert.equal(out.status, 503);
});
