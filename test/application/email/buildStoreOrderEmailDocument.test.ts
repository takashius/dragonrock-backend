import test from "node:test";
import assert from "node:assert/strict";
import {
  buildStoreOrderEmailDocument,
  buildStoreOrderPlainText,
} from "../../../application/email/buildStoreOrderEmailDocument.js";
import { resolveCompanyMailBranding } from "../../../application/email/companyMailBranding.js";

const companyRow = {
  name: "DragonRock",
  email: "tienda@dragonrock.com",
  phone: "+584121234567",
  address: "Caracas, Venezuela",
  logo: "https://res.cloudinary.com/demo/image/upload/v1/logo-white.png",
  currencySymbol: "$",
};

const baseParams = {
  orderNumber: "ORD-20260527-0001",
  customer: {
    name: "Juan Pérez",
    email: "juan@example.com",
    phone: "+584149876543",
    address: "Av. Principal 123",
  },
  items: [
    {
      productId: "507f1f77bcf86cd799439011",
      name: "Camiseta DragonRock",
      slug: "camiseta-dragonrock",
      sku: "DR-CAM-001",
      unitPrice: 25,
      quantity: 2,
      lineTotal: 50,
    },
  ],
  subtotal: 50,
  total: 50,
  notes: "Entregar por la tarde",
  companyRow,
};

test("resolveCompanyMailBranding: usa logo de la empresa", () => {
  const branding = resolveCompanyMailBranding(companyRow);
  assert.equal(branding.logoUrl, companyRow.logo);
  assert.equal(branding.name, "DragonRock");
  assert.equal(branding.currencySymbol, "$");
});

test("buildStoreOrderEmailDocument: HTML oscuro con logo y acento rojo", () => {
  const html = buildStoreOrderEmailDocument({
    ...baseParams,
    forCustomer: true,
  });
  assert.match(html, /#0a0a0a/);
  assert.match(html, /#dc2626/);
  assert.match(html, /logo-white\.png/);
  assert.match(html, /ORD-20260527-0001/);
  assert.match(html, /Camiseta DragonRock/);
  assert.match(html, /Rock · Emprendimiento · Cultura/);
  assert.match(html, /Entregar por la tarde/);
  assert.doesNotMatch(html, /erdesarrollo/i);
});

test("buildStoreOrderEmailDocument: variante tienda distinta al cliente", () => {
  const customer = buildStoreOrderEmailDocument({
    ...baseParams,
    forCustomer: true,
  });
  const store = buildStoreOrderEmailDocument({
    ...baseParams,
    forCustomer: false,
  });
  assert.match(customer, /Confirmación de pedido/);
  assert.match(store, /Nuevo pedido recibido/);
});

test("buildStoreOrderPlainText: incluye resumen legible", () => {
  const text = buildStoreOrderPlainText({
    ...baseParams,
    forCustomer: true,
  });
  assert.match(text, /ORD-20260527-0001/);
  assert.match(text, /Camiseta DragonRock/);
  assert.match(text, /Total: \$50\.00/);
});
