import Company from "../persistence/mongoose/companyModel.js";
import type { CompanyLookup } from "../../application/ports/companyLookup.js";
import type { CompanyOutcome } from "../../application/types/companyOutcome.js";

/**
 * Lectura de empresa (plantillas de correo, `COMPANY_DEFAULT`, etc.).
 */
export class MongooseCompanyLookup implements CompanyLookup {
  async getCompany(id: string | undefined): Promise<CompanyOutcome> {
    try {
      const query: Record<string, unknown> = id ? { _id: id } : { active: true };

      const result = await Company.findOne(query).populate({
        path: "created.user",
        select: ["name", "lastname"],
        model: "User",
      });
      return {
        status: 200,
        message: result,
      };
    } catch (e: unknown) {
      console.log("[ERROR] -> getCompany", e);
      return {
        status: 400,
        message: "Results error",
        detail: e,
      };
    }
  }
}
