import type { UserRepository } from "../ports/userRepository.js";
import type { CompanyLookup } from "../ports/companyLookup.js";
import type { MailSender } from "../ports/mailSender.js";
import type { UserOutcome } from "../types/userOutcome.js";
import { resolveDefaultCompanyForTransactionalMail } from "./resolveDefaultCompanyForTransactionalMail.js";

function randomSixDigitCode(): string {
  const min = 100000;
  const max = 999999;
  return String(Math.floor(Math.random() * (max - min + 1) + min));
}

export class RecoveryStepOneUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly companies: CompanyLookup,
    private readonly mail: MailSender,
    private readonly defaultCompanyId: string
  ) {}

  async execute(mail: string): Promise<UserOutcome> {
    try {
      const code = randomSixDigitCode();
      const foundUser = await this.users.recoveryStepOne(mail, code);
      if (!foundUser.status) {
        return {
          status: 400,
          message: "Correo no encontrado",
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
    <p>Ha solicitado restaurar su clave de acceso, copia el siguiente código en la pantalla de la aplicación para reestablecer su contraseña.</br>
    Si usted no solicitó este correo solo debe ignorarlo.</p>
    <p>
      Sus código es el siguiente: </br>
      <center>
        <h1 style="color: #153643; font-family: Arial, sans-serif; font-size: 42px;">${code}</h1>
      </center>
    </p>
    `;
      await this.mail.sendTransactional({
        config: configCompany,
        toEmail: mail,
        toName: `${u.name} ${u.lastname ?? ""}`,
        subject: "Recuperar contraseña",
        title: "Recuperación de clave",
        htmlMessage,
      });
      return {
        status: 200,
        message: "Email sent with the generated code",
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
