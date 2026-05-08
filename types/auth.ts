import type { Types } from "mongoose";

/** Usuario autenticado adjuntado por el middleware `auth` */
export interface AuthUserPayload {
  _id: Types.ObjectId;
  name: string;
  lastname?: string;
  email: string;
  areacode?: string;
  phone?: string;
  company: Types.ObjectId;
}
