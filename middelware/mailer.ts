import MailjetImport from "node-mailjet";
import mails from "./mails/index.js";
import config from "../config.js";

const Mailjet = MailjetImport as unknown as new (opts: {
  apiKey: string;
  apiSecret: string;
}) => {
  post: (
    path: string,
    opts: { version: string }
  ) => { request: (body: unknown) => Promise<unknown> };
};

type MailjetClient = InstanceType<typeof Mailjet>;

let mailjetClient: MailjetClient | undefined;

function getMailjetClient(): MailjetClient {
  if (mailjetClient) {
    return mailjetClient;
  }
  const pub = process.env.MJ_APIKEY_PUBLIC?.trim();
  const priv = process.env.MJ_APIKEY_PRIVATE?.trim();
  if (!pub || !priv) {
    throw new Error(
      "[mailer] Mailjet no configurado: define MJ_APIKEY_PUBLIC y MJ_APIKEY_PRIVATE."
    );
  }
  mailjetClient = new Mailjet({ apiKey: pub, apiSecret: priv });
  return mailjetClient;
}

export async function mailer(
  _config: unknown,
  correo: string,
  nombre: string,
  asunto: string,
  titulo: string,
  mensaje: string
): Promise<void> {
  const fromEmail = config.mailFromEmail?.trim();
  if (!fromEmail) {
    throw new Error(
      "[mailer] MAIL_FROM_EMAIL no definido (remitente verificado en Mailjet)."
    );
  }
  const fromName = config.mailFromName;
  const mj = getMailjetClient();
  const body = mails.MailDefault(titulo, mensaje);

  await mj.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: fromEmail,
          Name: fromName,
        },
        To: [
          {
            Email: correo,
            Name: nombre,
          },
        ],
        Subject: asunto,
        TextPart: mensaje,
        HTMLPart: body,
        CustomID: "c41.Su-J3-41-M4",
      },
    ],
  });
}
