/** Resultado estándar de casos de servicios (compatible con respuestas HTTP actuales). */
export type ServiceOutcome = {
  status: number;
  message: unknown;
  detail?: unknown;
};
