/** Resultado estándar de casos de contenido multimedia (compatible con respuestas HTTP actuales). */
export type MultimediaOutcome = {
  status: number;
  message: unknown;
  detail?: unknown;
};
