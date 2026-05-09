import test from "node:test";
import assert from "node:assert/strict";
import { sendUserOutcomeWithDetail } from "../../../presentation/http/userHttpMapper.js";
import {
  createMockRequest,
  createMockResponse,
} from "../../helpers/mockHttp.js";

test("sendUserOutcomeWithDetail: sin detail", () => {
  const res = createMockResponse();
  sendUserOutcomeWithDetail(
    res,
    createMockRequest(),
    { status: 400, message: "bad" }
  );
  assert.equal(res.mockStatusCode, 400);
  assert.equal(res.mockBody, "bad");
});
