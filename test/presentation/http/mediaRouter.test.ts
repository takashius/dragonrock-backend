import test from "node:test";
import assert from "node:assert/strict";
import type { NextFunction, Request, Response } from "express";
import type { AuthMiddlewareFactory } from "../../../presentation/http/authMiddlewareFactory.js";
import type { UploadMediaUseCase } from "../../../application/media/uploadMediaUseCase.js";
import type { DeleteMediaUseCase } from "../../../application/media/deleteMediaUseCase.js";
import { createMediaRouter } from "../../../presentation/http/mediaRouter.js";

function createAuthStub(): AuthMiddlewareFactory {
  return () =>
    (_req: Request, _res: Response, next: NextFunction): void => {
      next();
    };
}

function getRouteHandlers(router: ReturnType<typeof createMediaRouter>, method: "post", path: string) {
  const layer = (router as unknown as { stack: Array<{ route?: { path: string; methods: Record<string, boolean>; stack: Array<{ handle: (req: Request, res: Response, next: NextFunction) => unknown }> } }> }).stack.find(
    (entry) => entry.route?.path === path && entry.route?.methods[method]
  );
  if (!layer?.route) {
    throw new Error(`Route ${method.toUpperCase()} ${path} no encontrada`);
  }
  return layer.route.stack.map((entry) => entry.handle);
}

function createRes() {
  return {
    code: 0,
    body: undefined as unknown,
    status(c: number) {
      this.code = c;
      return this;
    },
    send(payload: unknown) {
      this.body = payload;
    },
    json(payload: unknown) {
      this.body = payload;
    },
  };
}

async function runRoute(
  router: ReturnType<typeof createMediaRouter>,
  method: "post",
  path: string,
  req: Request
): Promise<{ code: number; body: unknown }> {
  const handlers = getRouteHandlers(router, method, path);
  const res = createRes();

  for (const handler of handlers) {
    let nextCalled = false;
    await handler(req, res as unknown as Response, () => {
      nextCalled = true;
    });
    if (!nextCalled) {
      break;
    }
  }

  return { code: res.code, body: res.body };
}

test("mediaRouter: en modo deshabilitado responde 503", async () => {
  const router = createMediaRouter({
    auth: createAuthStub(),
    enabled: false,
  });

  const req = {
    body: {},
    header: () => "",
  } as unknown as Request;

  const out = await runRoute(router, "post", "/upload", req);
  assert.equal(out.code, 503);
});

test("mediaRouter: upload delega en el caso de uso", async () => {
  let payload: unknown;
  const upload = {
    async execute(input: unknown) {
      payload = input;
      return {
        status: 200,
        message: { publicId: "dragonrock/news/n1" },
      };
    },
  } as UploadMediaUseCase;

  const del = {
    async execute() {
      return { status: 200, message: "ok" };
    },
  } as DeleteMediaUseCase;

  const router = createMediaRouter({
    auth: createAuthStub(),
    enabled: true,
    uploadMedia: upload,
    deleteMedia: del,
  });

  const req = {
    body: {
      source: "data:image/png;base64,AAAA",
      folder: "dragonrock/news",
      resourceType: "image",
    },
    header: () => "",
  } as unknown as Request;

  const out = await runRoute(router, "post", "/upload", req);
  assert.equal(out.code, 200);
  assert.deepEqual(payload, {
    source: "data:image/png;base64,AAAA",
    folder: "dragonrock/news",
    resourceType: "image",
  });
});

test("mediaRouter: destroy valida body con zod", async () => {
  let called = false;
  const upload = {
    async execute() {
      return { status: 200, message: "ok" };
    },
  } as UploadMediaUseCase;
  const del = {
    async execute() {
      called = true;
      return { status: 200, message: "ok" };
    },
  } as DeleteMediaUseCase;

  const router = createMediaRouter({
    auth: createAuthStub(),
    enabled: true,
    uploadMedia: upload,
    deleteMedia: del,
  });

  const req = {
    body: {},
    header: () => "",
  } as unknown as Request;

  const out = await runRoute(router, "post", "/destroy", req);
  assert.equal(out.code, 400);
  assert.equal(called, false);
});
