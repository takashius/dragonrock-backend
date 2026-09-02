import test from "node:test";
import assert from "node:assert/strict";
import { GoogleRecaptchaVerifier } from "../../../infrastructure/captcha/googleRecaptchaVerifier.js";

test("GoogleRecaptchaVerifier: success sin score", async () => {
  const verifier = new GoogleRecaptchaVerifier("secret", 0.5, async () => ({
    success: true,
  }));
  const result = await verifier.verify("token");
  assert.equal(result.ok, true);
});

test("GoogleRecaptchaVerifier: rechaza success=false", async () => {
  const verifier = new GoogleRecaptchaVerifier("secret", 0.5, async () => ({
    success: false,
    "error-codes": ["invalid-input-response"],
  }));
  const result = await verifier.verify("token");
  assert.equal(result.ok, false);
});

test("GoogleRecaptchaVerifier: rechaza score bajo (v3)", async () => {
  const verifier = new GoogleRecaptchaVerifier("secret", 0.5, async () => ({
    success: true,
    score: 0.1,
  }));
  const result = await verifier.verify("token");
  assert.equal(result.ok, false);
  if (result.ok === false) {
    assert.equal(result.message, "Captcha score too low");
  }
});

test("GoogleRecaptchaVerifier: envía secret, token e IP", async () => {
  let seenBody = "";
  const verifier = new GoogleRecaptchaVerifier(
    "secret-key",
    0.5,
    async (_url, body) => {
      seenBody = body;
      return { success: true, score: 0.9 };
    }
  );
  await verifier.verify("tok-123", "1.2.3.4");
  const params = new URLSearchParams(seenBody);
  assert.equal(params.get("secret"), "secret-key");
  assert.equal(params.get("response"), "tok-123");
  assert.equal(params.get("remoteip"), "1.2.3.4");
});
