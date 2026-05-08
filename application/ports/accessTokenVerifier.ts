export type TokenVerifyResult =
  | { ok: true; userId: string }
  | { ok: false; jwtMessage?: string };

export interface AccessTokenVerifier {
  verify(token: string): TokenVerifyResult;
}
