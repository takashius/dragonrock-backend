import test from "node:test";
import assert from "node:assert/strict";
import type { Request } from "express";
import {
  isMultipartFormData,
  toDataUri,
} from "../../../presentation/http/parseUserMultipartPhoto.js";

test("isMultipartFormData: true cuando content-type es multipart", () => {
  const req = {
    headers: {
      "content-type": "multipart/form-data; boundary=abc",
    },
  } as unknown as Request;
  assert.equal(isMultipartFormData(req), true);
});

test("isMultipartFormData: false cuando content-type no es multipart", () => {
  const req = {
    headers: {
      "content-type": "application/json",
    },
  } as unknown as Request;
  assert.equal(isMultipartFormData(req), false);
});

test("toDataUri: construye data URI desde buffer", () => {
  const out = toDataUri({
    mimetype: "image/png",
    buffer: Buffer.from("hello"),
  });
  assert.equal(out, "data:image/png;base64,aGVsbG8=");
});
