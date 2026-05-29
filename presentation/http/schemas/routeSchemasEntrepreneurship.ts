import { z } from "zod";
import { objectIdString } from "./routeSchemas.js";

const entrepreneurshipStatusEnum = z.enum(["draft", "published"]);

export const entrepreneurshipQuestionSchema = z.object({
  question: z.string().min(1).max(5000),
  answer: z.string().min(1).max(100000),
});

export const createEntrepreneurshipBodySchema = z
  .object({
    entrepreneurName: z.string().min(1).max(200),
    businessName: z.string().min(1).max(200),
    role: z.string().max(200).optional(),
    category: z.string().min(1).max(200),
    location: z.string().max(300).optional(),
    website: z.string().max(500).optional(),
    status: entrepreneurshipStatusEnum,
    isFeatured: z.boolean().optional(),
    featuredImage: z.string().max(10_000_000).optional(),
    featuredQuote: z.string().max(2000).optional(),
    introduction: z.string().min(1).max(200000),
    questions: z.array(entrepreneurshipQuestionSchema).min(1).max(50),
    keyLearnings: z.array(z.string().min(1).max(2000)).max(50).optional(),
  })
  .passthrough();

export const updateEntrepreneurshipBodySchema = z
  .object({
    id: objectIdString,
    entrepreneurName: z.string().min(1).max(200).optional(),
    businessName: z.string().min(1).max(200).optional(),
    role: z.string().max(200).optional(),
    category: z.string().min(1).max(200).optional(),
    location: z.string().max(300).optional(),
    website: z.string().max(500).optional(),
    status: entrepreneurshipStatusEnum.optional(),
    isFeatured: z.boolean().optional(),
    featuredImage: z.string().max(10_000_000).optional(),
    featuredQuote: z.string().max(2000).optional(),
    introduction: z.string().min(1).max(200000).optional(),
    questions: z.array(entrepreneurshipQuestionSchema).min(1).max(50).optional(),
    keyLearnings: z.array(z.string().min(1).max(2000)).max(50).optional(),
  })
  .passthrough();

export const paginateEntrepreneurshipQuerySchema = z.object({
  search: z.string().max(500).optional(),
  filter: z.string().max(500).optional(),
  page: z
    .string()
    .regex(/^\d+$/)
    .max(10)
    .optional(),
  pageSize: z
    .string()
    .regex(/^\d+$/)
    .max(3)
    .optional(),
});

export type CreateEntrepreneurshipBody = z.infer<
  typeof createEntrepreneurshipBodySchema
>;
export type UpdateEntrepreneurshipBody = z.infer<
  typeof updateEntrepreneurshipBodySchema
>;
export type PaginateEntrepreneurshipQuery = z.infer<
  typeof paginateEntrepreneurshipQuerySchema
>;
