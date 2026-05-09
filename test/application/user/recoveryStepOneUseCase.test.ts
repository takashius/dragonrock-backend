import test from "node:test";
import assert from "node:assert/strict";
import { RecoveryStepOneUseCase } from "../../../application/user/recoveryStepOneUseCase.js";
import type { UserRepository } from "../../../application/ports/userRepository.js";
import type { CompanyLookup } from "../../../application/ports/companyLookup.js";
import type { MailSender } from "../../../application/ports/mailSender.js";

test("RecoveryStepOneUseCase: correo no encontrado", async () => {
  const users: UserRepository = {
    async recoveryStepOne() {
      return { status: false as const };
    },
  } as unknown as UserRepository;
  const uc = new RecoveryStepOneUseCase(
    users,
    {} as CompanyLookup,
    {} as MailSender,
    "def"
  );
  const r = await uc.execute("missing@example.com");
  assert.equal(r.status, 400);
  assert.equal(r.message, "Correo no encontrado");
});

test("RecoveryStepOneUseCase: éxito y envío de mail", async () => {
  const users: UserRepository = {
    async recoveryStepOne(_mail, _code) {
      return {
        status: true as const,
        user: { name: "A", lastname: "B" },
      };
    },
  } as unknown as UserRepository;
  const companies: CompanyLookup = {
    async getCompany() {
      return { status: 200, message: { x: 1 } };
    },
  };
  let mailed = false;
  const mail: MailSender = {
    async sendTransactional() {
      mailed = true;
    },
  };
  const uc = new RecoveryStepOneUseCase(users, companies, mail, "def");
  const r = await uc.execute("ok@example.com");
  assert.equal(r.status, 200);
  assert.equal(mailed, true);
});
