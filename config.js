import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const config = {
  dbUrl: process.env.BD_URL,
  monDebug: process.env.MONGO_DEBUG || false,
  port: process.env.PORT || 3031,
  host: process.env.HOST || "http://localhost",
  JWT_KEY: process.env.JWT_KEY,
  /** Duración estándar de JWT (`jsonwebtoken` `expiresIn`, ej: "365d", "90d") */
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
};

export default config;
