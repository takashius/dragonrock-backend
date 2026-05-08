export interface CompanyLookup {
  getCompany(id: string | undefined): Promise<{
    status: number;
    message: unknown;
  }>;
}
