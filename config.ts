import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

/** Exportado para pruebas unitarias del parseo de `CORS_ORIGINS`. */
export function parseCommaSeparatedOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function envBool(name: string, defaultValue: boolean): boolean {
  const v = process.env[name];
  if (v === undefined || v === "") {
    return defaultValue;
  }
  return v === "1" || v.toLowerCase() === "true" || v.toLowerCase() === "yes";
}

function envInt(name: string, fallback: number): number {
  const v = process.env[name];
  if (v === undefined || v === "") {
    return fallback;
  }
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";

export interface AppConfig {
  nodeEnv: string;
  isProduction: boolean;
  dbUrl: string | undefined;
  monDebug: boolean | string;
  port: number | string;
  host: string;
  JWT_KEY: string | undefined;
  jwtExpiresIn: string;
  publicRoute: string;
  staticRoute: string;
  filesRoute: string;
  dev: boolean;
  companyDefault: string | undefined;
  userAdmin: string | undefined;
  mailer: {
    host: string | undefined;
    port: string | number | undefined;
    user: string | undefined;
    pass: string | undefined;
    secure: boolean | string;
  };
  /** Orígenes permitidos CORS (vacío en desarrollo = permisivo). En producción debe estar definido. */
  corsOrigins: string[];
  swaggerEnabled: boolean;
  /** Si true, los fallos de verificación JWT incluyen detalle en la respuesta HTTP. */
  jwtExposeAuthErrors: boolean;
  mailjetRequired: boolean;
  mailFromEmail: string | undefined;
  mailFromName: string;
  trustProxy: number;
  rateLimitLoginWindowMs: number;
  rateLimitLoginMax: number;
  rateLimitSensitiveWindowMs: number;
  rateLimitSensitiveMax: number;
}

const config: AppConfig = {
  nodeEnv,
  isProduction,
  dbUrl: process.env.BD_URL,
  monDebug: process.env.MONGO_DEBUG || false,
  port: process.env.PORT || 3031,
  host: process.env.HOST || "http://localhost",
  JWT_KEY: process.env.JWT_KEY,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "365d",
  publicRoute: process.env.PUBLIC_ROUTE || "/public",
  staticRoute: process.env.PUBLIC_ROUTE || "/static",
  filesRoute: process.env.FILES_ROUTE || "/files",
  dev: process.env.NODE_ENV !== "production",
  companyDefault: process.env.COMPANY_DEFAULT,
  userAdmin: process.env.USER_ADMIN,
  mailer: {
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
    secure: process.env.MAILER_SECURE || false,
  },
  corsOrigins: parseCommaSeparatedOrigins(process.env.CORS_ORIGINS),
  swaggerEnabled: isProduction
    ? process.env.SWAGGER_ENABLED === "true"
    : process.env.SWAGGER_ENABLED !== "false",
  jwtExposeAuthErrors: isProduction
    ? process.env.JWT_EXPOSE_AUTH_ERRORS === "true"
    : process.env.JWT_EXPOSE_AUTH_ERRORS !== "false",
  mailjetRequired:
    isProduction || envBool("MAILJET_REQUIRED", false),
  mailFromEmail: process.env.MAIL_FROM_EMAIL?.trim() || undefined,
  mailFromName: process.env.MAIL_FROM_NAME?.trim() || "DragonRock",
  trustProxy: envInt("TRUST_PROXY", 0),
  rateLimitLoginWindowMs: envInt("RATE_LIMIT_LOGIN_WINDOW_MS", 15 * 60 * 1000),
  rateLimitLoginMax: envInt("RATE_LIMIT_LOGIN_MAX", 5),
  rateLimitSensitiveWindowMs: envInt(
    "RATE_LIMIT_SENSITIVE_WINDOW_MS",
    15 * 60 * 1000
  ),
  rateLimitSensitiveMax: envInt("RATE_LIMIT_SENSITIVE_MAX", 10),
};

export default config;

/**
 * Validaciones que deben fallar el arranque en producción (o cuando se exigen credenciales).
 * Llamar desde `index.ts` antes de levantar el servidor.
 */
export function assertSecurityConfigAtStartup(): void {
  if (config.isProduction && config.corsOrigins.length === 0) {
    throw new Error(
      "[fatal] En NODE_ENV=production debes definir CORS_ORIGINS (lista separada por comas de orígenes permitidos, p. ej. https://app.tudominio.com)."
    );
  }

  if (config.mailjetRequired) {
    const pub = process.env.MJ_APIKEY_PUBLIC?.trim();
    const priv = process.env.MJ_APIKEY_PRIVATE?.trim();
    if (!pub || !priv) {
      throw new Error(
        "[fatal] Mailjet es obligatorio (producción o MAILJET_REQUIRED=true): define MJ_APIKEY_PUBLIC y MJ_APIKEY_PRIVATE."
      );
    }
    if (!config.mailFromEmail?.trim()) {
      throw new Error(
        "[fatal] Con Mailjet obligatorio debes definir MAIL_FROM_EMAIL (remitente verificado en Mailjet)."
      );
    }
  }
}
