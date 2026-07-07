import {
  buildLogoHeaderHtml,
  buildMailFooterHtml,
  resolveCompanyMailBranding,
} from "./companyMailBranding.js";
import { escapeHtml } from "./escapeHtml.js";

/** Paleta alineada con la web DragonRock (fondo oscuro, texto claro, acento rojo). */
export const DRAGONROCK_EMAIL_THEME = {
  pageBg: "#0a0a0a",
  cardBg: "#111111",
  panelBg: "#171717",
  border: "#262626",
  text: "#f5f5f5",
  muted: "#a3a3a3",
  dim: "#737373",
  accent: "#dc2626",
} as const;

export function buildDragonRockEmailShell(params: {
  pageTitle: string;
  heading: string;
  intro: string;
  bodyHtml: string;
  companyRow: unknown;
}): string {
  const branding = resolveCompanyMailBranding(params.companyRow);
  const logoHeader = buildLogoHeaderHtml(branding);
  const footer = buildMailFooterHtml(branding);
  const t = DRAGONROCK_EMAIL_THEME;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(params.pageTitle)}</title>
</head>
<body style="margin:0;padding:0;background-color:${t.pageBg};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${t.pageBg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;background-color:${t.cardBg};border:1px solid ${t.border};border-radius:8px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:36px 32px 28px;background-color:${t.pageBg};">
              ${logoHeader}
            </td>
          </tr>
          <tr>
            <td style="height:3px;background-color:${t.accent};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px 32px 12px;font-family:Arial,Helvetica,sans-serif;">
              <h1 style="margin:0;font-size:24px;line-height:30px;font-weight:700;color:${t.text};">
                ${escapeHtml(params.heading)}
              </h1>
              <p style="margin:12px 0 0;font-size:15px;line-height:24px;color:${t.muted};">
                ${params.intro}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px;">
              ${params.bodyHtml}
            </td>
          </tr>
          ${
            footer
              ? `<tr>
            <td style="padding:24px 32px 32px;border-top:1px solid ${t.border};background-color:${t.pageBg};">
              ${footer}
              <p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:${t.dim};text-align:center;">
                &copy; ${escapeHtml(branding.name)} · DragonRock
              </p>
            </td>
          </tr>`
              : ""
          }
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildInfoPanelHtml(params: {
  label: string;
  lines: string[];
}): string {
  const t = DRAGONROCK_EMAIL_THEME;
  const content = params.lines
    .map(
      (line) =>
        `<span style="display:block;color:${t.muted};">${escapeHtml(line)}</span>`
    )
    .join("");
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background:${t.panelBg};border:1px solid ${t.border};border-radius:6px;">
      <tr>
        <td style="padding:20px 20px 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.12em;text-transform:uppercase;color:${t.dim};">
          ${escapeHtml(params.label)}
        </td>
      </tr>
      <tr>
        <td style="padding:0 20px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:24px;color:${t.text};">
          ${content}
        </td>
      </tr>
    </table>`;
}

export function buildMessageBlockHtml(message: string): string {
  const t = DRAGONROCK_EMAIL_THEME;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;border-collapse:collapse;background:${t.panelBg};border:1px solid ${t.border};border-left:3px solid ${t.accent};border-radius:6px;">
      <tr>
        <td style="padding:16px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:${t.muted};white-space:pre-wrap;">
          ${escapeHtml(message)}
        </td>
      </tr>
    </table>`;
}
