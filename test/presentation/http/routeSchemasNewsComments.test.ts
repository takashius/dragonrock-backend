import test from "node:test";
import assert from "node:assert/strict";
import { createPublicNewsCommentBodySchema } from "../../../presentation/http/schemas/routeSchemasNewsComments.js";

test("createPublicNewsCommentBodySchema: payload válido", () => {
  const parsed = createPublicNewsCommentBodySchema.safeParse({
    name: "Carlos M.",
    body: "Gran artículo",
    captchaToken: "token-recaptcha",
  });
  assert.equal(parsed.success, true);
});

test("createPublicNewsCommentBodySchema: name corto falla", () => {
  const parsed = createPublicNewsCommentBodySchema.safeParse({
    name: "A",
    body: "Gran artículo",
  });
  assert.equal(parsed.success, false);
});

test("createPublicNewsCommentBodySchema: body vacío falla", () => {
  const parsed = createPublicNewsCommentBodySchema.safeParse({
    name: "Carlos",
    body: "",
  });
  assert.equal(parsed.success, false);
});

test("createPublicNewsCommentBodySchema: captchaToken es opcional", () => {
  const parsed = createPublicNewsCommentBodySchema.safeParse({
    name: "Carlos",
    body: "Gran artículo",
  });
  assert.equal(parsed.success, true);
});
