import test from "node:test";
import assert from "node:assert/strict";
import { normalizeEntrepreneurshipMultipartBody } from "../../../presentation/http/normalizeEntrepreneurshipMultipartBody.js";

test("normalizeEntrepreneurshipMultipartBody: parsea questions JSON y quita featuredImage inválido", () => {
  const body: Record<string, unknown> = {
    featuredImage: "string",
    questions: JSON.stringify([
      { question: "Q?", answer: "<p>A</p>" },
    ]),
    keyLearnings: JSON.stringify(["Aprendizaje 1"]),
    isFeatured: "true",
  };
  normalizeEntrepreneurshipMultipartBody(body);
  assert.equal("featuredImage" in body, false);
  assert.deepEqual(body.questions, [{ question: "Q?", answer: "<p>A</p>" }]);
  assert.deepEqual(body.keyLearnings, ["Aprendizaje 1"]);
  assert.equal(body.isFeatured, true);
});
