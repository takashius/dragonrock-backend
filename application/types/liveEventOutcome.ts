/** Resultado estándar de casos de eventos en vivo (compatible con respuestas HTTP actuales). */
export type LiveEventOutcome = {
  status: number;
  message: unknown;
  detail?: unknown;
};
