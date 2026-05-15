import test from "node:test";
import assert from "node:assert/strict";
import type { UserRepository } from "../../../application/ports/userRepository.js";
import type { UserOutcome } from "../../../application/types/userOutcome.js";
import { ListUsersUseCase } from "../../../application/user/listUsersUseCase.js";
import { GetUserUseCase } from "../../../application/user/getUserUseCase.js";
import { LoginUserUseCase } from "../../../application/user/loginUserUseCase.js";
import { AddUserUseCase } from "../../../application/user/addUserUseCase.js";
import { DeleteUserUseCase } from "../../../application/user/deleteUserUseCase.js";
import { UpdateUserUseCase } from "../../../application/user/updateUserUseCase.js";
import { LogoutUserUseCase } from "../../../application/user/logoutUserUseCase.js";
import { LogoutAllUseCase } from "../../../application/user/logoutAllUseCase.js";
import { AddCompanyUseCase } from "../../../application/user/addCompanyUseCase.js";
import { RemoveCompanyUseCase } from "../../../application/user/removeCompanyUseCase.js";
import { SelectCompanyUseCase } from "../../../application/user/selectCompanyUseCase.js";

const ok: UserOutcome = { status: 200, message: "ok" };

function repo(partial: Partial<UserRepository>): UserRepository {
  return partial as UserRepository;
}

test("ListUsersUseCase", async () => {
  let called = false;
  const r = repo({
    async getUsers() {
      called = true;
      return ok;
    },
  });
  const out = await new ListUsersUseCase(r).execute();
  assert.equal(called, true);
  assert.equal(out.status, 200);
});

test("GetUserUseCase: sin id", async () => {
  const out = await new GetUserUseCase(repo({})).execute(null);
  assert.equal(out.status, 400);
});

test("GetUserUseCase: con id", async () => {
  let id: string | null = null;
  const out = await new GetUserUseCase(
    repo({
      async getUser(userId) {
        id = userId;
        return ok;
      },
    })
  ).execute("abc");
  assert.equal(id, "abc");
  assert.equal(out.status, 200);
});

test("LoginUserUseCase", async () => {
  let e = "";
  let p = "";
  await new LoginUserUseCase(
    repo({
      async loginUser(mail, pass) {
        e = mail;
        p = pass;
        return ok;
      },
    })
  ).execute({ email: "a@b.c", password: "secret" });
  assert.equal(e, "a@b.c");
  assert.equal(p, "secret");
});

test("AddUserUseCase", async () => {
  const body = { email: "x" };
  await new AddUserUseCase(
    repo({
      async addUser(u) {
        assert.deepEqual(u, body);
        return ok;
      },
    })
  ).execute(body as Record<string, unknown>);
});

test("DeleteUserUseCase", async () => {
  let id = "";
  await new DeleteUserUseCase(
    repo({
      async deleteUser(i) {
        id = i;
        return ok;
      },
    })
  ).execute("id1");
  assert.equal(id, "id1");
});

test("UpdateUserUseCase: sin id en body", async () => {
  const out = await new UpdateUserUseCase(repo({})).execute({ id: "" });
  assert.equal(out.status, 400);
});

test("UpdateUserUseCase: delega", async () => {
  await new UpdateUserUseCase(
    repo({
      async updateUser(u) {
        assert.equal(u.id, "1");
        assert.equal(u.role, "Editor");
        return ok;
      },
    })
  ).execute({ id: "1", name: "n", role: "Editor" });
});

test("LogoutUserUseCase", async () => {
  let t = "";
  await new LogoutUserUseCase(
    repo({
      async logoutUser(_id, token) {
        t = token;
      },
    })
  ).execute("uid", "tok");
  assert.equal(t, "tok");
});

test("LogoutAllUseCase", async () => {
  let id = "";
  await new LogoutAllUseCase(
    repo({
      async logoutAll(i) {
        id = i;
      },
    })
  ).execute("u2");
  assert.equal(id, "u2");
});

test("AddCompanyUseCase", async () => {
  await new AddCompanyUseCase(
    repo({
      async addCompany(uid, cid) {
        assert.equal(uid, "u");
        assert.equal(cid, "c");
        return ok;
      },
    })
  ).execute("u", "c");
});

test("RemoveCompanyUseCase", async () => {
  await new RemoveCompanyUseCase(
    repo({
      async removeCompany(uid, cid) {
        assert.equal(uid, "u1");
        assert.equal(cid, "c1");
        return ok;
      },
    })
  ).execute("u1", "c1");
});

test("SelectCompanyUseCase", async () => {
  await new SelectCompanyUseCase(
    repo({
      async selectCompany(uid, cid) {
        assert.equal(uid, "u2");
        assert.equal(cid, "c2");
        return ok;
      },
    })
  ).execute("u2", "c2");
});
