import test from "node:test";
import assert from "node:assert/strict";
import { resolveDefaultCompanyForTransactionalMail } from "../../../application/user/resolveDefaultCompanyForTransactionalMail.js";
import type { CompanyLookup } from "../../../application/ports/companyLookup.js";

test("resolveDefaultCompanyForTransactionalMail: empresa encontrada", async () => {
  const row = { name: "Acme", _id: "x" };
  const companies: CompanyLookup = {
    async getCompany() {
      return { status: 200, message: row };
    },
  };
  const r = await resolveDefaultCompanyForTransactionalMail(
    companies,
    "any-id"
  );
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.deepEqual(r.companyRow, row);
  }
});

test("resolveDefaultCompanyForTransactionalMail: sin fila", async () => {
  const companies: CompanyLookup = {
    async getCompany() {
      return { status: 200, message: null };
    },
  };
  const r = await resolveDefaultCompanyForTransactionalMail(
    companies,
    "id"
  );
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.equal(r.outcome.status, 500);
    assert.equal(
      r.outcome.message,
      "Configuración de empresa por defecto no encontrada"
    );
  }
});
