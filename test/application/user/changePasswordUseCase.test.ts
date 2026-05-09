import test from "node:test";
import assert from "node:assert/strict";
import { Types } from "mongoose";
import { ChangePasswordUseCase } from "../../../application/user/changePasswordUseCase.js";
import type { UserRepository } from "../../../application/ports/userRepository.js";
import type { AuthUserPayload } from "../../../application/types/authUserPayload.js";

const baseUser: AuthUserPayload = {
  _id: new Types.ObjectId(),
  name: "U",
  email: "u@example.com",
  company: new Types.ObjectId(),
};

test("ChangePasswordUseCase: falta contraseña", async () => {
  const uc = new ChangePasswordUseCase({} as UserRepository);
  const r = await uc.execute(baseUser, "");
  assert.equal(r.status, 400);
});

test("ChangePasswordUseCase: delega al repositorio", async () => {
  let email = "";
  let pass = "";
  const uc = new ChangePasswordUseCase({
    async changePassword(u, p) {
      email = u.email;
      pass = p;
      return { status: 200, message: "ok" };
    },
  } as unknown as UserRepository);
  const r = await uc.execute(baseUser, "newSecret1");
  assert.equal(email, "u@example.com");
  assert.equal(pass, "newSecret1");
  assert.equal(r.status, 200);
});
