import type { Types } from "mongoose";

/** Usuario autenticado tras validar token (contrato de la aplicación / middleware HTTP). */
export interface AuthUserPayload {
  _id: Types.ObjectId;
  name: string;
  lastname?: string;
  email: string;
  areacode?: string;
  phone?: string;
  company: Types.ObjectId;
}
