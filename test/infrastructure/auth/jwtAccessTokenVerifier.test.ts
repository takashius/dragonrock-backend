import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { JwtAccessTokenVerifier } from "../../../infrastructure/auth/jwtAccessTokenVerifier.js";

const SECRET = "test-secret-for-jwt-unit-tests-min-32-chars!!";

test("JwtAccessTokenVerifier: token válido", () => {
  const token = jwt.sign({ _id: "507f1f77bcf86cd799439011" }, SECRET);
  const v = new JwtAccessTokenVerifier(SECRET, true);
  const r = v.verify(token);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.userId, "507f1f77bcf86cd799439011");
  }
});

test("JwtAccessTokenVerifier: token inválido sin detalle", () => {
  const v = new JwtAccessTokenVerifier(SECRET, false);
  const r = v.verify("not-a-jwt");
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.equal("jwtMessage" in r && r.jwtMessage, false);
  }
});

test("JwtAccessTokenVerifier: token inválido con detalle", () => {
  const v = new JwtAccessTokenVerifier(SECRET, true);
  const r = v.verify("not-a-jwt");
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(typeof r.jwtMessage === "string" && r.jwtMessage.length > 0);
  }
});

test("JwtAccessTokenVerifier: firma incorrecta", () => {
  const token = jwt.sign({ _id: "507f1f77bcf86cd799439011" }, "other-secret-key-for-jwt-tests-32");
  const v = new JwtAccessTokenVerifier(SECRET, false);
  const r = v.verify(token);
  assert.equal(r.ok, false);
});
