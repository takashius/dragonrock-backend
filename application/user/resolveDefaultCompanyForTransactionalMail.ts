import type { CompanyLookup } from "../ports/companyLookup.js";
import type { UserOutcome } from "../types/userOutcome.js";

const missingDefaultCompanyOutcome: UserOutcome = {
  status: 500,
  message: "Configuración de empresa por defecto no encontrada",
};

/**
 * Resuelve la fila de empresa usada como remitente/plantilla en correos transaccionales
 * (Mailjet). Evita duplicar la misma comprobación en varios casos de uso (DRY).
 */
export async function resolveDefaultCompanyForTransactionalMail(
  companies: CompanyLookup,
  defaultCompanyId: string
): Promise<
  | { ok: true; companyRow: unknown }
  | { ok: false; outcome: UserOutcome }
> {
  const crud = await companies.getCompany(defaultCompanyId);
  const companyRow = crud.message;
  if (!companyRow) {
    return { ok: false, outcome: missingDefaultCompanyOutcome };
  }
  return { ok: true, companyRow };
}
