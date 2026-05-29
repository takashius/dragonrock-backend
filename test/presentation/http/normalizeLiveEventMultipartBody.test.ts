import test from "node:test";
import assert from "node:assert/strict";
import { normalizeLiveEventMultipartBody } from "../../../presentation/http/normalizeLiveEventMultipartBody.js";

test("normalizeLiveEventMultipartBody: coerce isFeatured, price y quita image inválido", () => {
  const body: Record<string, unknown> = {
    image: "string",
    isFeatured: "true",
    latitude: "4.711",
    longitude: "-74.072",
    price: "25.5",
  };
  normalizeLiveEventMultipartBody(body);
  assert.equal("image" in body, false);
  assert.equal(body.isFeatured, true);
  assert.equal(body.latitude, 4.711);
  assert.equal(body.longitude, -74.072);
  assert.equal(body.price, 25.5);
});
