import test from "node:test";
import assert from "node:assert/strict";
import { sendNewsCommentOutcome } from "../../../presentation/http/newsCommentHttpMapper.js";
import {
  createMockRequest,
  createMockResponse,
} from "../../helpers/mockHttp.js";

test("sendNewsCommentOutcome: 200", () => {
  const res = createMockResponse();
  sendNewsCommentOutcome(res, createMockRequest(), {
    status: 200,
    message: [],
  });
  assert.equal(res.mockStatusCode, 200);
  assert.deepEqual(res.mockBody, []);
});

test("sendNewsCommentOutcome: 404", () => {
  const res = createMockResponse();
  sendNewsCommentOutcome(res, createMockRequest(), {
    status: 404,
    message: "Comment not found",
  });
  assert.equal(res.mockStatusCode, 404);
  assert.equal(res.mockBody, "Comment not found");
});

test("sendNewsCommentOutcome: 403", () => {
  const res = createMockResponse();
  sendNewsCommentOutcome(res, createMockRequest(), {
    status: 403,
    message: { error: "Only administrators can delete comments" },
  });
  assert.equal(res.mockStatusCode, 403);
  assert.deepEqual(res.mockBody, {
    error: "Only administrators can delete comments",
  });
});
