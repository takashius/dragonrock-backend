import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOrderLineSnapshots,
  mergeOrderLineItems,
} from "../../../application/storeOrders/storeOrderHelpers.js";

const products = [
  {
    _id: "507f1f77bcf86cd799439011",
    name: "Camiseta DragonRock",
    slug: "camiseta-dragonrock",
    sku: "DR-CAM-001",
    price: 25,
    stock: 10,
  },
  {
    _id: "507f1f77bcf86cd799439012",
    name: "Gorra",
    slug: "gorra",
    price: 15,
    stock: 2,
  },
];

test("mergeOrderLineItems: suma cantidades del mismo producto", () => {
  const merged = mergeOrderLineItems([
    { productId: "507f1f77bcf86cd799439011", quantity: 1 },
    { productId: "507f1f77bcf86cd799439011", quantity: 2 },
  ]);
  assert.deepEqual(merged, [
    { productId: "507f1f77bcf86cd799439011", quantity: 3 },
  ]);
});

test("buildOrderLineSnapshots: calcula subtotal", () => {
  const built = buildOrderLineSnapshots(
    [
      { productId: "507f1f77bcf86cd799439011", quantity: 2 },
      { productId: "507f1f77bcf86cd799439012", quantity: 1 },
    ],
    products
  );
  assert.equal(built.ok, true);
  if (built.ok) {
    assert.equal(built.subtotal, 65);
    assert.equal(built.items.length, 2);
  }
});

test("buildOrderLineSnapshots: stock insuficiente", () => {
  const built = buildOrderLineSnapshots(
    [{ productId: "507f1f77bcf86cd799439012", quantity: 5 }],
    products
  );
  assert.equal(built.ok, false);
});

test("buildOrderLineSnapshots: producto no disponible", () => {
  const built = buildOrderLineSnapshots(
    [{ productId: "507f1f77bcf86cd799439099", quantity: 1 }],
    products
  );
  assert.equal(built.ok, false);
});
