import test from "node:test";
import assert from "node:assert/strict";
import { Types } from "mongoose";
import { AuthenticateUserUseCase } from "../../../application/user/authenticateUserUseCase.js";
import type { AccessTokenVerifier } from "../../../application/ports/accessTokenVerifier.js";
import type { UserRepository } from "../../../application/ports/userRepository.js";

function makeUserDoc(overrides: Partial<{ selected: boolean }> = {}) {
  const companyId = new Types.ObjectId();
  const userId = new Types.ObjectId();
  return {
    _id: userId,
    name: "Ada",
    lastname: "Lovelace",
    email: "ada@example.com",
    phone: "000",
    companys: [
      {
        selected: overrides.selected !== false,
        company: companyId,
      },
    ],
  };
}

test("AuthenticateUserUseCase: token vacío", async () => {
  const verifier: AccessTokenVerifier = {
    verify: () => ({ ok: false }),
  };
  const users: UserRepository = {
    async findActiveUserWithToken() {
      return null;
    },
  } as unknown as UserRepository;
  const uc = new AuthenticateUserUseCase(verifier, users);
  const r = await uc.execute("   ");
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.match(r.errorMessage, /Authorization header missing/);
  }
});

test("AuthenticateUserUseCase: JWT no válido", async () => {
  const verifier: AccessTokenVerifier = {
    verify: () => ({ ok: false, jwtMessage: "jwt expired" }),
  };
  const users = {} as unknown as UserRepository;
  const uc = new AuthenticateUserUseCase(verifier, users);
  const r = await uc.execute("tok");
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.match(r.errorMessage, /jwt expired/);
  }
});

test("AuthenticateUserUseCase: usuario no encontrado", async () => {
  const verifier: AccessTokenVerifier = {
    verify: () => ({ ok: true, userId: "507f1f77bcf86cd799439011" }),
  };
  const users: UserRepository = {
    async findActiveUserWithToken() {
      return null;
    },
  } as unknown as UserRepository;
  const uc = new AuthenticateUserUseCase(verifier, users);
  const r = await uc.execute("tok");
  assert.equal(r.ok, false);
});

test("AuthenticateUserUseCase: sin empresa seleccionada", async () => {
  const doc = makeUserDoc({ selected: false });
  (doc as { companys: { selected: boolean; company: Types.ObjectId }[] }).companys[0].selected = false;
  const verifier: AccessTokenVerifier = {
    verify: () => ({ ok: true, userId: String(doc._id) }),
  };
  const users: UserRepository = {
    async findActiveUserWithToken() {
      return doc;
    },
  } as unknown as UserRepository;
  const uc = new AuthenticateUserUseCase(verifier, users);
  const r = await uc.execute("tok");
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.match(r.errorMessage, /No company selected/);
  }
});

test("AuthenticateUserUseCase: éxito", async () => {
  const doc = makeUserDoc();
  const verifier: AccessTokenVerifier = {
    verify: () => ({ ok: true, userId: String(doc._id) }),
  };
  const users: UserRepository = {
    async findActiveUserWithToken() {
      return doc;
    },
  } as unknown as UserRepository;
  const uc = new AuthenticateUserUseCase(verifier, users);
  const r = await uc.execute("  bearer-token-value  ");
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.token, "bearer-token-value");
    assert.equal(String(r.user._id), String(doc._id));
    assert.equal(r.user.email, "ada@example.com");
    assert.equal(String(r.user.company), String(doc.companys[0].company));
  }
});
