import type {
  CaptchaVerifier,
  CaptchaVerificationResult,
} from "../../application/ports/captchaVerifier.js";

const SITEVERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export type RecaptchaSiteVerifyResponse = {
  success?: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
};

export type RecaptchaHttpPost = (
  url: string,
  body: string
) => Promise<RecaptchaSiteVerifyResponse>;

async function defaultPost(
  url: string,
  body: string
): Promise<RecaptchaSiteVerifyResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    throw new Error(`reCAPTCHA siteverify HTTP ${response.status}`);
  }
  return (await response.json()) as RecaptchaSiteVerifyResponse;
}

export class GoogleRecaptchaVerifier implements CaptchaVerifier {
  constructor(
    private readonly secretKey: string,
    private readonly minScore: number,
    private readonly postForm: RecaptchaHttpPost = defaultPost
  ) {}

  async verify(
    token: string,
    remoteIp?: string
  ): Promise<CaptchaVerificationResult> {
    try {
      const params = new URLSearchParams();
      params.set("secret", this.secretKey);
      params.set("response", token);
      if (remoteIp) {
        params.set("remoteip", remoteIp);
      }

      const payload = await this.postForm(SITEVERIFY_URL, params.toString());
      if (!payload.success) {
        return { ok: false, message: "Captcha verification failed" };
      }

      if (
        typeof payload.score === "number" &&
        payload.score < this.minScore
      ) {
        return { ok: false, message: "Captcha score too low" };
      }

      return { ok: true };
    } catch (e: unknown) {
      console.log("[ERROR] -> recaptchaVerify", e);
      return { ok: false, message: "Captcha verification failed" };
    }
  }
}
