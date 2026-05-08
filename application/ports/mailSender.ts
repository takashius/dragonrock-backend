export interface MailSender {
  sendTransactional(params: {
    config: unknown;
    toEmail: string;
    toName: string;
    subject: string;
    title: string;
    htmlMessage: string;
  }): Promise<void>;
}
