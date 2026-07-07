import { z } from "zod";

export const submitPublicContactBodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().min(3).max(50).optional(),
  subject: z.string().min(1).max(300),
  message: z.string().min(1).max(10000),
});

export type SubmitPublicContactBody = z.infer<
  typeof submitPublicContactBodySchema
>;
