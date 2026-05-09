import test from "node:test";
import assert from "node:assert/strict";
import { sendNewsOutcome } from "../../../presentation/http/newsHttpMapper.js";
import {
  createMockRequest,
  createMockResponse,
} from "../../helpers/mockHttp.js";

test("sendNewsOutcome: 200", () => {
  const res = createMockResponse();
  const req = createMockRequest();
  sendNewsOutcome(res, req, { status: 200, message: { items: [] } });
  assert.equal(res.mockStatusCode, 200);
  assert.deepEqual(res.mockBody, { items: [] });
});

test("sendNewsOutcome: 404", () => {
  const res = createMockResponse();
  sendNewsOutcome(res, createMockRequest(), {
    status: 404,
    message: "gone",
  });
  assert.equal(res.mockStatusCode, 404);
  assert.equal(res.mockBody, "gone");
});

test("sendNewsOutcome: error sin detail", () => {
  const res = createMockResponse();
  sendNewsOutcome(res, createMockRequest(), {
    status: 422,
    message: "bad",
  });
  assert.equal(res.mockStatusCode, 422);
  assert.equal(res.mockBody, "bad");
});
