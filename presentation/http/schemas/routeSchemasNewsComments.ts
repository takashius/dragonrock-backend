import { z } from "zod";

export const createPublicNewsCommentBodySchema = z.object({
  name: z.string().min(2).max(80),
  body: z.string().min(1).max(2000),
  captchaToken: z.string().min(1).max(4000).optional(),
});

export type CreatePublicNewsCommentBody = z.infer<
  typeof createPublicNewsCommentBodySchema
>;
