import test from "node:test";
import assert from "node:assert/strict";
import {
  buildContactEmailDocument,
  buildContactPlainText,
} from "../../../application/email/buildContactEmailDocument.js";
import type { CompanyLookup } from "../../../application/ports/companyLookup.js";
import type { MailSender } from "../../../application/ports/mailSender.js";
import { SubmitPublicContactUseCase } from "../../../application/contact/submitPublicContactUseCase.js";

const payload = {
  name: "María López",
  email: "maria@example.com",
  phone: "+584149876543",
  subject: "Consulta sobre merch",
  message: "Hola, quisiera saber si tienen camisetas talla L.",
};

const companyRow = {
  name: "DragonRock",
  email: "tienda@dragonrock.com",
  logo: "https://res.cloudinary.com/demo/logo.png",
};

test("buildContactEmailDocument: plantilla oscura con datos del formulario", () => {
  const html = buildContactEmailDocument(payload, companyRow);
  assert.match(html, /Nuevo mensaje de contacto/);
  assert.match(html, /Consulta sobre merch/);
  assert.match(html, /María López/);
  assert.match(html, /maria@example.com/);
  assert.match(html, /camisetas talla L/);
  assert.match(html, /#0a0a0a/);
});

test("buildContactPlainText: incluye campos principales", () => {
  const text = buildContactPlainText(payload);
  assert.match(text, /María López/);
  assert.match(text, /Consulta sobre merch/);
});

test("SubmitPublicContactUseCase: envía correo a la empresa con Reply-To", async () => {
  let sentTo = "";
  let replyTo = "";
  const companies: CompanyLookup = {
    async getCompany() {
      return { status: 200, message: companyRow };
    },
  };
  const mail: MailSender = {
    async sendTransactional(params) {
      sentTo = params.toEmail;
      replyTo = params.replyToEmail ?? "";
    },
  };

  const out = await new SubmitPublicContactUseCase(
    companies,
    mail,
    "company-id"
  ).execute(payload);

  assert.equal(out.status, 200);
  assert.equal(sentTo, "tienda@dragonrock.com");
  assert.equal(replyTo, "maria@example.com");
});

test("SubmitPublicContactUseCase: empresa sin email retorna 500", async () => {
  const out = await new SubmitPublicContactUseCase(
    { async getCompany() { return { status: 200, message: { name: "X" } }; } },
    { async sendTransactional() {} },
    "company-id"
  ).execute(payload);
  assert.equal(out.status, 500);
});
