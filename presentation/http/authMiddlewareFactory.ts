import type { NextFunction, Request, Response } from "express";
import type { AuthenticateUserUseCase } from "../../application/user/authenticateUserUseCase.js";

export type AuthMiddlewareFactory = ReturnType<typeof createAuthMiddleware>;

/**
 * Misma forma que el antiguo `auth()`: devuelve un middleware Express.
 */
export function createAuthMiddleware(
  authenticateUser: AuthenticateUserUseCase
) {
  return function auth() {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const rawAuth = req.header("Authorization") || "";
        const token = rawAuth.replace(/^Bearer\s+/i, "").trim();
        const result = await authenticateUser.execute(token);
        if (!result.ok) {
          res.status(401).send({ error: result.errorMessage });
          return;
        }
        req.user = result.user;
        req.token = result.token;
        next();
      } catch (error: unknown) {
        console.log("AUTH ERROR", error);
        let message = "Not authorized to access this resource";
        if (error instanceof Error && error.message) {
          message = `Not authorized to access this resource - ${error.message}`;
        }
        res.status(401).send({ error: message });
      }
    };
  };
}
