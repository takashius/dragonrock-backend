import type { CompanyLookup } from "../ports/companyLookup.js";
import type { MailSender } from "../ports/mailSender.js";
import type { ContactFormInput, ContactOutcome } from "../types/contactOutcome.js";
import { resolveDefaultCompanyForTransactionalMail } from "../user/resolveDefaultCompanyForTransactionalMail.js";
import {
  buildContactEmailDocument,
  buildContactPlainText,
} from "../email/buildContactEmailDocument.js";
import { asCompanyEmail, asCompanyName } from "../storeOrders/storeOrderHelpers.js";

export class SubmitPublicContactUseCase {
  constructor(
    private readonly companies: CompanyLookup,
    private readonly mail: MailSender,
    private readonly defaultCompanyId: string
  ) {}

  async execute(payload: ContactFormInput): Promise<ContactOutcome> {
    try {
      const resolved = await resolveDefaultCompanyForTransactionalMail(
        this.companies,
        this.defaultCompanyId
      );
      if (!resolved.ok) {
        return {
          status: resolved.outcome.status,
          message: resolved.outcome.message,
          detail: resolved.outcome.detail,
        };
      }

      const companyEmail = asCompanyEmail(resolved.companyRow);
      if (!companyEmail) {
        return {
          status: 500,
          message: "Company email not configured for contact form",
        };
      }

      const companyName = asCompanyName(resolved.companyRow);
      const text = buildContactPlainText(payload);
      const html = buildContactEmailDocument(payload, resolved.companyRow);

      await this.mail.sendTransactional({
        config: resolved.companyRow,
        toEmail: companyEmail,
        toName: companyName,
        subject: `Contacto web — ${payload.subject}`,
        title: "Nuevo mensaje de contacto",
        htmlMessage: text,
        fullHtmlDocument: html,
        textMessage: text,
        replyToEmail: payload.email,
        replyToName: payload.name,
      });

      return {
        status: 200,
        message: { text: "Message sent successfully" },
      };
    } catch (e: unknown) {
      console.log("[ERROR] -> submitPublicContact", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
