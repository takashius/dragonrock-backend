import Mailjet from "node-mailjet";
import mails from "./mails/index.js";
const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC || "your-api-key",
  apiSecret: process.env.MJ_APIKEY_PRIVATE || "your-api-secret",
});

export async function mailer(
  config,
  correo,
  nombre,
  asunto,
  titulo,
  mensaje
) {
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
