import type {
  StoreOrderCustomerInput,
  StoreOrderLineItemSnapshot,
} from "../types/storeOrderOutcome.js";
import { formatMoney } from "../storeOrders/storeOrderHelpers.js";
import {
  buildLogoHeaderHtml,
  buildMailFooterHtml,
  resolveCompanyMailBranding,
} from "./companyMailBranding.js";
import { escapeHtml } from "./escapeHtml.js";

/** Paleta alineada con la web DragonRock (fondo oscuro, texto claro, acento rojo). */
const THEME = {
  pageBg: "#0a0a0a",
  cardBg: "#111111",
  panelBg: "#171717",
  border: "#262626",
  text: "#f5f5f5",
  muted: "#a3a3a3",
  dim: "#737373",
  accent: "#dc2626",
} as const;

export type StoreOrderEmailParams = {
  orderNumber: string;
  customer: StoreOrderCustomerInput;
  items: StoreOrderLineItemSnapshot[];
  subtotal: number;
  total: number;
  notes?: string;
  forCustomer: boolean;
  companyRow: unknown;
};

function formatCurrency(amount: number, symbol: string): string {
  return `${symbol}${formatMoney(amount)}`;
}

function buildItemRows(
  items: StoreOrderLineItemSnapshot[],
  symbol: string
): string {
  return items
    .map((item) => {
      const sku = item.sku
        ? `<br/><span style="color:${THEME.dim};font-size:11px;">SKU: ${escapeHtml(item.sku)}</span>`
        : "";
      return `
        <tr>
          <td style="padding:14px 12px;border-bottom:1px solid ${THEME.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:${THEME.text};">
            ${escapeHtml(item.name)}${sku}
          </td>
          <td align="center" style="padding:14px 8px;border-bottom:1px solid ${THEME.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${THEME.muted};">
            ${item.quantity}
          </td>
          <td align="right" style="padding:14px 8px;border-bottom:1px solid ${THEME.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${THEME.muted};">
            ${formatCurrency(item.unitPrice, symbol)}
          </td>
          <td align="right" style="padding:14px 12px;border-bottom:1px solid ${THEME.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${THEME.text};">
            ${formatCurrency(item.lineTotal, symbol)}
          </td>
        </tr>`;
    })
    .join("");
}

function buildCustomerBlock(customer: StoreOrderCustomerInput): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background:${THEME.panelBg};border:1px solid ${THEME.border};border-radius:6px;">
      <tr>
        <td style="padding:20px 20px 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.12em;text-transform:uppercase;color:${THEME.dim};">
          Datos de envío
        </td>
      </tr>
      <tr>
        <td style="padding:0 20px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:24px;color:${THEME.text};">
          <strong style="color:${THEME.text};">${escapeHtml(customer.name)}</strong><br/>
          <span style="color:${THEME.muted};">${escapeHtml(customer.email)}</span><br/>
          <span style="color:${THEME.muted};">${escapeHtml(customer.phone)}</span><br/>
          <span style="color:${THEME.muted};">${escapeHtml(customer.address)}</span>
        </td>
      </tr>
    </table>`;
}

function buildNotesBlock(notes: string | undefined): string {
  if (!notes?.trim()) {
    return "";
  }
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;border-collapse:collapse;background:${THEME.panelBg};border:1px solid ${THEME.border};border-left:3px solid ${THEME.accent};border-radius:6px;">
      <tr>
        <td style="padding:16px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:${THEME.muted};">
          <strong style="display:block;margin-bottom:6px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${THEME.dim};">Notas del cliente</strong>
          ${escapeHtml(notes.trim())}
        </td>
      </tr>
    </table>`;
}

function buildPlainItemsList(
  items: StoreOrderLineItemSnapshot[],
  symbol: string
): string {
  return items
    .map(
      (item) =>
        `- ${item.name}${item.sku ? ` (${item.sku})` : ""} x${item.quantity} = ${formatCurrency(item.lineTotal, symbol)}`
    )
    .join("\n");
}

export function buildStoreOrderPlainText(
  params: StoreOrderEmailParams
): string {
  const branding = resolveCompanyMailBranding(params.companyRow);
  const symbol = branding.currencySymbol;
  const title = params.forCustomer
    ? "Confirmación de pedido"
    : "Nuevo pedido en la tienda";
  const intro = params.forCustomer
    ? "Gracias por tu compra. Hemos recibido tu pedido y pronto nos pondremos en contacto contigo."
    : "Se registró un nuevo pedido en la tienda DragonRock.";

  const lines = [
    branding.name,
    title,
    "",
    intro,
    "",
    `Pedido: ${params.orderNumber}`,
    "",
    "Datos del cliente:",
    params.customer.name,
    params.customer.email,
    params.customer.phone,
    params.customer.address,
  ];

  if (params.notes?.trim()) {
    lines.push("", `Notas: ${params.notes.trim()}`);
  }

  lines.push(
    "",
    "Productos:",
    buildPlainItemsList(params.items, symbol),
    "",
    `Total: ${formatCurrency(params.total, symbol)}`
  );

  if (branding.phone || branding.email) {
    lines.push("", "Contacto:");
    if (branding.phone) {
      lines.push(branding.phone);
    }
    if (branding.email) {
      lines.push(branding.email);
    }
  }

  return lines.join("\n");
}

export function buildStoreOrderEmailDocument(
  params: StoreOrderEmailParams
): string {
  const branding = resolveCompanyMailBranding(params.companyRow);
  const symbol = branding.currencySymbol;
  const title = params.forCustomer
    ? "Confirmación de pedido"
    : "Nuevo pedido recibido";
  const intro = params.forCustomer
    ? "Gracias por tu compra en DragonRock. Hemos recibido tu pedido y pronto nos pondremos en contacto contigo para coordinar la entrega."
    : "Se registró un nuevo pedido en la tienda. Revisa los detalles a continuación para gestionarlo.";

  const itemRows = buildItemRows(params.items, symbol);
  const footer = buildMailFooterHtml(branding);
  const logoHeader = buildLogoHeaderHtml(branding);
  const notesBlock = buildNotesBlock(params.notes);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(title)} — ${escapeHtml(params.orderNumber)}</title>
</head>
<body style="margin:0;padding:0;background-color:${THEME.pageBg};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${THEME.pageBg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;background-color:${THEME.cardBg};border:1px solid ${THEME.border};border-radius:8px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:36px 32px 28px;background-color:${THEME.pageBg};">
              ${logoHeader}
            </td>
          </tr>
          <tr>
            <td style="height:3px;background-color:${THEME.accent};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px 32px 12px;font-family:Arial,Helvetica,sans-serif;">
              <h1 style="margin:0;font-size:24px;line-height:30px;font-weight:700;color:${THEME.text};">
                ${escapeHtml(title)}
              </h1>
              <p style="margin:12px 0 0;font-size:15px;line-height:24px;color:${THEME.muted};">
                ${intro}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${THEME.panelBg};border:1px solid ${THEME.border};border-left:3px solid ${THEME.accent};border-radius:6px;">
                <tr>
                  <td style="padding:16px 20px;font-family:Arial,Helvetica,sans-serif;">
                    <span style="display:block;font-size:11px;line-height:16px;letter-spacing:0.14em;text-transform:uppercase;color:${THEME.dim};">Número de pedido</span>
                    <strong style="display:block;margin-top:4px;font-size:20px;line-height:28px;color:${THEME.text};">${escapeHtml(params.orderNumber)}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              ${buildCustomerBlock(params.customer)}
            </td>
          </tr>
          ${notesBlock ? `<tr><td style="padding:0 32px 24px;">${notesBlock}</td></tr>` : ""}
          <tr>
            <td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${THEME.panelBg};border:1px solid ${THEME.border};border-radius:6px;overflow:hidden;">
                <tr>
                  <td colspan="4" style="padding:16px 20px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.12em;text-transform:uppercase;color:${THEME.dim};border-bottom:1px solid ${THEME.border};">
                    Resumen del pedido
                  </td>
                </tr>
                <tr>
                  <th align="left" style="padding:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.08em;text-transform:uppercase;color:${THEME.dim};border-bottom:1px solid ${THEME.border};">Producto</th>
                  <th align="center" style="padding:12px 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.08em;text-transform:uppercase;color:${THEME.dim};border-bottom:1px solid ${THEME.border};">Cant.</th>
                  <th align="right" style="padding:12px 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.08em;text-transform:uppercase;color:${THEME.dim};border-bottom:1px solid ${THEME.border};">Precio</th>
                  <th align="right" style="padding:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.08em;text-transform:uppercase;color:${THEME.dim};border-bottom:1px solid ${THEME.border};">Subtotal</th>
                </tr>
                ${itemRows}
                <tr>
                  <td colspan="3" align="right" style="padding:18px 12px 18px 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${THEME.text};">
                    Total
                  </td>
                  <td align="right" style="padding:18px 12px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:${THEME.accent};">
                    ${formatCurrency(params.total, symbol)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${
            footer
              ? `<tr>
            <td style="padding:24px 32px 32px;border-top:1px solid ${THEME.border};background-color:${THEME.pageBg};">
              ${footer}
              <p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:${THEME.dim};text-align:center;">
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
