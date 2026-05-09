import type { Request, Response } from "express";

/** Respuesta Express mínima encadenable para pruebas de mappers HTTP. */
export function createMockResponse(): Response & {
  mockStatusCode: number;
  mockBody: unknown;
} {
  const state = { code: 0, body: undefined as unknown };
  const res = {
    mockStatusCode: 0,
    mockBody: undefined as unknown,
    status(code: number) {
      state.code = code;
      this.mockStatusCode = code;
      return this;
    },
    send(body: unknown) {
      state.body = body;
      this.mockBody = body;
      return this;
    },
    json(body: unknown) {
      state.body = body;
      this.mockBody = body;
      return this;
    },
  };
  return res as unknown as Response & {
    mockStatusCode: number;
    mockBody: unknown;
  };
}

export function createMockRequest(
  partial: Partial<Request> = {}
): Request {
  return partial as Request;
}
