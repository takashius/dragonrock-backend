import type { CompanyLookup } from "../../application/ports/companyLookup.js";
import { getCompany } from "../../components/company/store.js";

export class LegacyCompanyLookup implements CompanyLookup {
  async getCompany(id: string | undefined) {
    return getCompany(id);
  }
}
