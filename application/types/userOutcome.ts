/** Resultado estándar de casos de usuario (compatible con respuestas HTTP actuales). */
export type UserOutcome = {
  status: number;
  message: unknown;
  detail?: unknown;
};

export type RecoveryStepOneResult =
  | { status: true; user: unknown }
  | { status: false; text?: string };

export type RecoveryStepTwoResult =
  | { status: true; user: unknown }
  | { status: false; text?: string };
