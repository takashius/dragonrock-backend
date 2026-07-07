/** Resultado estándar del formulario de contacto. */
export type ContactOutcome = {
  status: number;
  message: unknown;
  detail?: unknown;
};

export type ContactFormInput = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};
