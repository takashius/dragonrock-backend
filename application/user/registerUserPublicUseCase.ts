import * as validator from "email-validator";
import type { UserRepository } from "../ports/userRepository.js";
import type { CompanyLookup } from "../ports/companyLookup.js";
import type { MailSender } from "../ports/mailSender.js";
import type { UserOutcome } from "../types/userOutcome.js";
import { resolveDefaultCompanyForTransactionalMail } from "./resolveDefaultCompanyForTransactionalMail.js";

export class RegisterUserPublicUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly companies: CompanyLookup,
    private readonly mail: MailSender,
    private readonly defaultCompanyId: string
  ) {}

  async execute(data: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    docId: string;
  }): Promise<UserOutcome> {
    try {
      if (!data.email) {
        return { status: 400, message: { email: "Email is required" } };
      }
      if (!validator.validate(data.email)) {
        return { status: 400, message: { email: "Email is not valid" } };
      }
      const user = await this.users.registerUserPublic(data);
      if (user.status !== 201 || !("message" in user) || !user.message) {
        return user;
      }
      const userData = user.message as {
        name: string;
        company: string;
        docId: string;
        email: string;
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
    <p>Se ha registrado de forma exitosa en el sistema, a continuación sus datos registrados en nuestra App.</p>
    <p>
      <ul>
        <li><strong>Nombre:</strong> ${userData.name}</li>
        <li><strong>Empresa:</strong> ${userData.company}</li>
        <li><strong>Rif:</strong> ${userData.docId}</li>
        <li><strong>Correo:</strong> ${userData.email}</li>
      </ul>
    </p>
    `;
      await this.mail.sendTransactional({
        config: configCompany,
        toEmail: userData.email,
        toName: `${userData.name}`,
        subject: "Registro Exitoso",
        title: "Nuevo registro en DragonRock",
        htmlMessage,
      });
      return user;
    } catch (e: unknown) {
      console.log("Controller -> registerUserPublic", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
