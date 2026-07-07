export interface MailSender {
  sendTransactional(params: {
    config: unknown;
    toEmail: string;
    toName: string;
    subject: string;
    title: string;
    htmlMessage: string;
    /** Si se define, se usa como HTML completo sin plantilla legacy. */
    fullHtmlDocument?: string;
    /** Texto plano; si no se envía, se usa htmlMessage. */
    textMessage?: string;
    /** Reply-To para que la tienda responda al remitente del formulario. */
    replyToEmail?: string;
    replyToName?: string;
  }): Promise<void>;
}
