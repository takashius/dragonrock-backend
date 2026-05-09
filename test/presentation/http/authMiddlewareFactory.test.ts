import test from "node:test";
import assert from "node:assert/strict";
import { Types } from "mongoose";
import { createAuthMiddleware } from "../../../presentation/http/authMiddlewareFactory.js";
import type { AuthenticateUserUseCase } from "../../../application/user/authenticateUserUseCase.js";
import type { Request, Response, NextFunction } from "express";
import type { AuthUserPayload } from "../../../application/types/authUserPayload.js";

test("createAuthMiddleware: 401 si execute falla", async () => {
  const authenticateUser = {
    async execute() {
      return {
        ok: false as const,
        errorMessage: "Not authorized",
      };
    },
  } as AuthenticateUserUseCase;
  const auth = createAuthMiddleware(authenticateUser);
  const middleware = auth();
  let nextCalls = 0;
  const req = {
    header: () => "Bearer x",
  } as unknown as Request;
  const res = {
    code: 0,
    body: undefined as unknown,
    status(c: number) {
      this.code = c;
      return this;
    },
    send(b: unknown) {
      this.body = b;
    },
  };
  await middleware(
    req,
    res as unknown as Response,
    (() => {
      nextCalls += 1;
    }) as NextFunction
  );
  assert.equal(nextCalls, 0);
  assert.equal((res as { code: number }).code, 401);
});

test("createAuthMiddleware: llama next y adjunta user", async () => {
  const companyId = new Types.ObjectId();
  const user: AuthUserPayload = {
    _id: new Types.ObjectId(),
    name: "U",
    email: "u@e.com",
    company: companyId,
  };
  const authenticateUser = {
    async execute() {
      return { ok: true as const, user, token: "tok123" };
    },
  } as AuthenticateUserUseCase;
  const auth = createAuthMiddleware(authenticateUser);
  const middleware = auth();
  const req = {
    header: () => "Bearer tok123",
    user: undefined as AuthUserPayload | undefined,
    token: undefined as string | undefined,
  } as unknown as Request;
  let nextCalls = 0;
  await middleware(
    req,
    {} as Response,
    (() => {
      nextCalls += 1;
    }) as NextFunction
  );
  assert.equal(nextCalls, 1);
  assert.equal(req.token, "tok123");
  assert.equal(String(req.user?.email), "u@e.com");
});
