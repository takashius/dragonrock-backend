import type { CompanyOutcome } from "../types/companyOutcome.js";

export interface CompanyLookup {
  getCompany(id: string | undefined): Promise<CompanyOutcome>;
}
