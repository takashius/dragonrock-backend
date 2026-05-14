import { disconnect } from "mongoose";
import config from "../config.js";
import connect from "../db.js";
import Company from "../infrastructure/persistence/mongoose/companyModel.js";
import User from "../infrastructure/persistence/mongoose/userModel.js";

type CliOptions = {
  name?: string;
  email?: string;
  rif?: string;
  adminId?: string;
  adminEmail?: string;
  createAdmin?: boolean;
  adminName?: string;
  adminPassword?: string;
  phone?: string;
  address?: string;
  description?: string;
};

function parseCliOptions(argv: string[]): CliOptions {
  const options: CliOptions = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (current === "--create-admin") {
      options.createAdmin = true;
      continue;
    }
    const next = argv[i + 1];
    if (!current.startsWith("--")) {
      continue;
    }
    if (!next || next.startsWith("--")) {
      continue;
    }
    const key = current.slice(2);
    switch (key) {
      case "name":
        options.name = next;
        i += 1;
        break;
      case "email":
        options.email = next;
        i += 1;
        break;
      case "rif":
        options.rif = next;
        i += 1;
        break;
      case "admin-id":
        options.adminId = next;
        i += 1;
        break;
      case "admin-email":
        options.adminEmail = next;
        i += 1;
        break;
      case "admin-name":
        options.adminName = next;
        i += 1;
        break;
      case "admin-password":
        options.adminPassword = next;
        i += 1;
        break;
      case "phone":
        options.phone = next;
        i += 1;
        break;
      case "address":
        options.address = next;
        i += 1;
        break;
      case "description":
        options.description = next;
        i += 1;
        break;
      default:
        break;
    }
  }
  return options;
}

function printUsage(): void {
  console.log(`
Uso:
  npm run seed:company -- --name "Empresa Base" --email "empresa@local.test" --rif "J-00000000-0" --admin-email "admin@local.test"

Alternativa por id:
  npm run seed:company -- --name "Empresa Base" --email "empresa@local.test" --rif "J-00000000-0" --admin-id "665f6f8d9f0f0f0f0f0f0f0f"

Crear admin automáticamente si no existe:
  npm run seed:company -- --name "Empresa Base" --email "empresa@local.test" --rif "J-00000000-0" --admin-email "admin@local.test" --create-admin --admin-password "Admin12345"

Opcionales:
  --admin-name "Administrador"
  --phone "0212-555-0000"
  --address "Caracas"
  --description "Empresa inicial para entorno dev"
`);
}

async function main(): Promise<void> {
  const args = parseCliOptions(process.argv.slice(2));
  const name = args.name?.trim();
  const email = args.email?.trim().toLowerCase();
  const rif = args.rif?.trim();
  const adminId = args.adminId?.trim();
  const adminEmail = args.adminEmail?.trim().toLowerCase();
  const adminPassword = args.adminPassword?.trim();

  if (!name || !email || !rif || (!adminId && !adminEmail)) {
    printUsage();
    throw new Error(
      "Faltan argumentos obligatorios: --name, --email, --rif y (--admin-id o --admin-email)"
    );
  }

  if (!config.dbUrl?.trim()) {
    throw new Error("BD_URL no está definida en el entorno.");
  }

  await connect(config.dbUrl);

  const userFilter = adminId
    ? { _id: adminId, active: true }
    : { email: adminEmail, active: true };
  let adminUser = await User.findOne(userFilter);
  let createdAdmin = false;

  if (!adminUser && args.createAdmin) {
    if (!adminEmail) {
      throw new Error(
        "Para --create-admin debes usar --admin-email (no aplica con --admin-id)."
      );
    }
    if (!adminPassword) {
      throw new Error(
        "Para --create-admin debes indicar --admin-password (min. 8 caracteres recomendado)."
      );
    }

    adminUser = new User({
      name: args.adminName?.trim() || "Administrador",
      email: adminEmail,
      password: adminPassword,
    });
    await adminUser.save();
    createdAdmin = true;
  }

  if (!adminUser) {
    throw new Error(
      "No se encontró el usuario admin para asociar la empresa. Usa un admin existente o agrega --create-admin --admin-password."
    );
  }

  let company = await Company.findOne({
    $or: [{ email }, { rif }],
  });
  let created = false;

  if (!company) {
    company = new Company({
      name,
      email,
      rif,
      phone: args.phone?.trim(),
      address: args.address?.trim(),
      description: args.description?.trim(),
      created: {
        user: adminUser._id,
      },
    });
    await company.save();
    created = true;
  }

  const hasCompany = adminUser.companys.some(
    (entry: { company: unknown }) => String(entry.company) === String(company._id)
  );

  if (!hasCompany) {
    adminUser.companys = adminUser.companys.concat({
      company: company._id,
      selected: adminUser.companys.length === 0,
    });
    await adminUser.save();
  }

  console.log(
    created
      ? `Empresa creada con éxito: ${company._id}`
      : `La empresa ya existía: ${company._id}`
  );
  if (createdAdmin) {
    console.log(`Usuario admin creado con éxito: ${adminUser._id}`);
  }
  console.log(`USER_ADMIN recomendado: ${adminUser._id}`);
  console.log(`COMPANY_DEFAULT recomendado: ${company._id}`);
}

main()
  .catch((error: unknown) => {
    console.error("[seed:company] Error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnect();
  });
