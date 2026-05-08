/** Resultado de lecturas de empresa (misma forma que user/news para HTTP futuro). */
export type CompanyOutcome = {
  status: number;
  message: unknown;
  detail?: unknown;
};
