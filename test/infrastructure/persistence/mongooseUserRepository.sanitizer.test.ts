import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeUserListRow } from "../../../infrastructure/persistence/mongooseUserRepository.js";

test("sanitizeUserListRow: oculta company/companys y token", () => {
  const out = sanitizeUserListRow({
    id: "u1",
    name: "Ana",
    company: "c1",
    companys: [{ company: "c1", selected: true }],
    token: "jwt",
    password: "hashed",
    role: "Editor",
  }) as Record<string, unknown>;

  assert.equal(out.company, undefined);
  assert.equal(out.companys, undefined);
  assert.equal(out.token, undefined);
  assert.equal(out.password, undefined);
  assert.equal(out.name, "Ana");
  assert.equal(out.role, "Editor");
});
