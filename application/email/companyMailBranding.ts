import { escapeHtml } from "./escapeHtml.js";

export type CompanyMailBranding = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  currencySymbol: string;
};

export function resolveCompanyMailBranding(
  companyRow: unknown
): CompanyMailBranding {
  if (!companyRow || typeof companyRow !== "object") {
    return {
      name: "DragonRock",
      email: null,
      phone: null,
      address: null,
      logoUrl: null,
      currencySymbol: "$",
    };
  }
  const row = companyRow as Record<string, unknown>;

  return {
    name:
      typeof row.name === "string" && row.name.trim()
        ? row.name.trim()
        : "DragonRock",
    email:
      typeof row.email === "string" && row.email.trim()
        ? row.email.trim()
        : null,
    phone:
      typeof row.phone === "string" && row.phone.trim()
        ? row.phone.trim()
        : null,
    address:
      typeof row.address === "string" && row.address.trim()
        ? row.address.trim()
        : null,
    logoUrl:
      typeof row.logo === "string" && row.logo.trim() ? row.logo.trim() : null,
    currencySymbol:
      typeof row.currencySymbol === "string" && row.currencySymbol.trim()
        ? row.currencySymbol.trim()
        : "$",
  };
}

export function buildLogoHeaderHtml(branding: CompanyMailBranding): string {
  const tagline = "Rock · Emprendimiento · Cultura";
  if (branding.logoUrl) {
    return `
      <img
        src="${escapeHtml(branding.logoUrl)}"
        alt="${escapeHtml(branding.name)}"
        width="220"
        style="display:block;margin:0 auto;max-width:220px;height:auto;border:0;"
      />
      <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.2em;text-transform:uppercase;color:#737373;text-align:center;">
        ${tagline}
      </p>`;
  }
  return `
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:32px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#ffffff;text-align:center;">
      ${escapeHtml(branding.name)}
    </p>
    <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.2em;text-transform:uppercase;color:#737373;text-align:center;">
      ${tagline}
    </p>`;
}

export function buildMailFooterHtml(branding: CompanyMailBranding): string {
  const lines: string[] = [];
  if (branding.phone) {
    lines.push(
      `<a href="tel:${escapeHtml(branding.phone)}" style="color:#dc2626;text-decoration:none;">${escapeHtml(branding.phone)}</a>`
    );
  }
  if (branding.email) {
    lines.push(
      `<a href="mailto:${escapeHtml(branding.email)}" style="color:#dc2626;text-decoration:none;">${escapeHtml(branding.email)}</a>`
    );
  }
  if (branding.address) {
    lines.push(escapeHtml(branding.address));
  }
  if (lines.length === 0) {
    return "";
  }
  return `
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;letter-spacing:0.14em;text-transform:uppercase;color:#737373;text-align:center;">
      Contacto
    </p>
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:22px;color:#a3a3a3;text-align:center;">
      ${lines.join("<br/>")}
    </p>`;
}
