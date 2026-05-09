import type { AuthUserPayload } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
      token?: string;
      /** Relleno por `validateQuery` en rutas que lo usan. */
      validatedQuery?: unknown;
    }
  }
}

export {};
