import test from "node:test";
import assert from "node:assert/strict";
import { RecoveryStepTwoUseCase } from "../../../application/user/recoveryStepTwoUseCase.js";
import type { UserRepository } from "../../../application/ports/userRepository.js";
import type { CompanyLookup } from "../../../application/ports/companyLookup.js";
import type { MailSender } from "../../../application/ports/mailSender.js";

test("RecoveryStepTwoUseCase: código incorrecto", async () => {
  const users: UserRepository = {
    async recoveryStepTwo() {
      return { status: false as const };
    },
  } as unknown as UserRepository;
  const uc = new RecoveryStepTwoUseCase(
    users,
    {} as CompanyLookup,
    {} as MailSender,
    "def"
  );
  const r = await uc.execute({
    email: "e@e.com",
    code: "000000",
    newPass: "x",
  });
  assert.equal(r.status, 400);
});

test("RecoveryStepTwoUseCase: éxito", async () => {
  const users: UserRepository = {
    async recoveryStepTwo() {
      return {
        status: true as const,
        user: { name: "A", lastname: "B" },
      };
    },
  } as unknown as UserRepository;
  const companies: CompanyLookup = {
    async getCompany() {
      return { status: 200, message: {} };
    },
  };
  let mailed = false;
  const mail: MailSender = {
    async sendTransactional() {
      mailed = true;
    },
  };
  const uc = new RecoveryStepTwoUseCase(users, companies, mail, "def");
  const r = await uc.execute({
    email: "e@e.com",
    code: "123456",
    newPass: "newPass99",
  });
  assert.equal(r.status, 200);
  assert.equal(mailed, true);
});
