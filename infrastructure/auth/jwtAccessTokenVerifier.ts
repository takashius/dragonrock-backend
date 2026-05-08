import jwt from "jsonwebtoken";
import type {
  AccessTokenVerifier,
  TokenVerifyResult,
} from "../../application/ports/accessTokenVerifier.js";

export class JwtAccessTokenVerifier implements AccessTokenVerifier {
  constructor(private readonly secret: string) {}

  verify(token: string): TokenVerifyResult {
    try {
      const data = jwt.verify(token, this.secret) as { _id?: string };
      if (!data?._id) {
        return { ok: false };
      }
      return { ok: true, userId: String(data._id) };
    } catch (e: unknown) {
      const jwtMessage = e instanceof Error ? e.message : undefined;
      return { ok: false, jwtMessage };
    }
  }
}
