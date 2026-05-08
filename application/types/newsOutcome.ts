/**
 * Resultado de operaciones de noticias (misma forma que el antiguo `store`
 * para mapeo HTTP estable durante la migración).
 */
export type NewsOutcome = {
  status: number;
  message: unknown;
  detail?: unknown;
};
