import test from "node:test";
import assert from "node:assert/strict";
import { RegisterUserPublicUseCase } from "../../../application/user/registerUserPublicUseCase.js";
import type { UserRepository } from "../../../application/ports/userRepository.js";
import type { CompanyLookup } from "../../../application/ports/companyLookup.js";
import type { MailSender } from "../../../application/ports/mailSender.js";

test("RegisterUserPublicUseCase: email requerido", async () => {
  const uc = new RegisterUserPublicUseCase(
    {} as UserRepository,
    {} as CompanyLookup,
    {} as MailSender,
    "def"
  );
  const r = await uc.execute({
    name: "n",
    email: "",
    password: "p",
    companyName: "c",
    docId: "d",
  });
  assert.equal(r.status, 400);
});

test("RegisterUserPublicUseCase: email inválido", async () => {
  const uc = new RegisterUserPublicUseCase(
    {} as UserRepository,
    {} as CompanyLookup,
    {} as MailSender,
    "def"
  );
  const r = await uc.execute({
    name: "n",
    email: "no-es-email",
    password: "p",
    companyName: "c",
    docId: "d",
  });
  assert.equal(r.status, 400);
});

test("RegisterUserPublicUseCase: 201 y correo", async () => {
  const users: UserRepository = {
    async registerUserPublic() {
      return {
        status: 201,
        message: {
          name: "N",
          company: "Co",
          docId: "RIF",
          email: "n@example.com",
        },
      };
    },
  } as unknown as UserRepository;
  const companies: CompanyLookup = {
    async getCompany() {
      return { status: 200, message: { id: "cfg" } };
    },
  };
  let sent = false;
  const mail: MailSender = {
    async sendTransactional() {
      sent = true;
    },
  };
  const uc = new RegisterUserPublicUseCase(users, companies, mail, "def");
  const r = await uc.execute({
    name: "N",
    email: "n@example.com",
    password: "password1",
    companyName: "Co",
    docId: "RIF",
  });
  assert.equal(r.status, 201);
  assert.equal(sent, true);
});
