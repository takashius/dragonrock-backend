import type { UserRepository } from "../ports/userRepository.js";
import type { CompanyLookup } from "../ports/companyLookup.js";
import type { MailSender } from "../ports/mailSender.js";
import type { UserOutcome } from "../types/userOutcome.js";
import { resolveDefaultCompanyForTransactionalMail } from "./resolveDefaultCompanyForTransactionalMail.js";

export class RecoveryStepTwoUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly companies: CompanyLookup,
    private readonly mail: MailSender,
    private readonly defaultCompanyId: string
  ) {}

  async execute(data: {
    email: string;
    code: string;
    newPass: string;
  }): Promise<UserOutcome> {
    try {
      const foundUser = await this.users.recoveryStepTwo(
        data.email,
        data.code,
        data.newPass
      );
      if (!foundUser.status) {
        return {
          status: 400,
          message: "Codigo incorrecto",
        };
      }
      const u = foundUser.user as {
        name: string;
        lastname?: string;
      };
      const resolved = await resolveDefaultCompanyForTransactionalMail(
        this.companies,
        this.defaultCompanyId
      );
      if (!resolved.ok) {
        return resolved.outcome;
      }
      const configCompany = resolved.companyRow;
      const htmlMessage = `
    <p>Se ha cambiado su contraseña exitosamente.</p>
    `;
      await this.mail.sendTransactional({
        config: configCompany,
        toEmail: data.email,
        toName: `${u.name} ${u.lastname ?? ""}`,
        subject: "Cambio de clave exitoso",
        title: "Cambio de clave",
        htmlMessage,
      });
      return {
        status: 200,
        message: "Your password has been changed successfully",
      };
    } catch (e: unknown) {
      console.log(e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
