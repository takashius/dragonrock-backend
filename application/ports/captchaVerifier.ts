export type CaptchaVerificationResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Verificación anti-spam (reCAPTCHA u otro proveedor compatible).
 */
export interface CaptchaVerifier {
  verify(
    token: string,
    remoteIp?: string
  ): Promise<CaptchaVerificationResult>;
}
