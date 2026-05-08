import MailjetImport from "node-mailjet";
import mails from "./mails/index.js";

const Mailjet = MailjetImport as unknown as new (opts: {
  apiKey: string;
  apiSecret: string;
}) => {
  post: (
    path: string,
    opts: { version: string }
  ) => { request: (body: unknown) => Promise<unknown> };
};

const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC || "your-api-key",
  apiSecret: process.env.MJ_APIKEY_PRIVATE || "your-api-secret",
});

export async function mailer(
  _config: unknown,
  correo: string,
  nombre: string,
  asunto: string,
  titulo: string,
  mensaje: string
): Promise<void> {
  const body = mails.MailDefault(titulo, mensaje);

  await mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "envios@erdesarrollo.com.ve",
          Name: "DragonRock",
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
