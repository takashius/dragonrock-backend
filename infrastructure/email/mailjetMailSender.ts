import type { MailSender } from "../../application/ports/mailSender.js";
import { mailer } from "../../middelware/mailer.js";

export class MailjetMailSender implements MailSender {
  async sendTransactional(params: {
    config: unknown;
    toEmail: string;
    toName: string;
    subject: string;
    title: string;
    htmlMessage: string;
  }): Promise<void> {
    await mailer(
      params.config,
      params.toEmail,
      params.toName,
      params.subject,
      params.title,
      params.htmlMessage
    );
  }
}
