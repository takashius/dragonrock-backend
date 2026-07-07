import {
  buildDragonRockEmailShell,
  buildInfoPanelHtml,
  buildMessageBlockHtml,
} from "./dragonrockEmailLayout.js";
import { escapeHtml } from "./escapeHtml.js";
import type { ContactFormInput } from "../types/contactOutcome.js";

export function buildContactPlainText(input: ContactFormInput): string {
  const lines = [
    "Nuevo mensaje desde el formulario de contacto",
    "",
    `Nombre: ${input.name}`,
    `Correo: ${input.email}`,
  ];
  if (input.phone?.trim()) {
    lines.push(`Teléfono: ${input.phone.trim()}`);
  }
  lines.push(`Asunto: ${input.subject}`, "", "Mensaje:", input.message);
  return lines.join("\n");
}

export function buildContactEmailDocument(
  input: ContactFormInput,
  companyRow: unknown
): string {
  const contactLines = [
    input.name,
    input.email,
    ...(input.phone?.trim() ? [input.phone.trim()] : []),
  ];

  const bodyHtml = `
    ${buildInfoPanelHtml({ label: "Asunto", lines: [input.subject] })}
    ${buildInfoPanelHtml({ label: "Datos de contacto", lines: contactLines })}
    <p style="margin:16px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.12em;text-transform:uppercase;color:#737373;">
      Mensaje
    </p>
    ${buildMessageBlockHtml(input.message)}
    <p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#737373;">
      Puedes responder directamente a este correo; la respuesta irá a
      <a href="mailto:${escapeHtml(input.email)}" style="color:#dc2626;text-decoration:none;">${escapeHtml(input.email)}</a>.
    </p>`;

  return buildDragonRockEmailShell({
    pageTitle: `Contacto — ${input.subject}`,
    heading: "Nuevo mensaje de contacto",
    intro:
      "Alguien escribió desde el formulario de contacto del sitio web DragonRock.",
    bodyHtml,
    companyRow,
  });
}
