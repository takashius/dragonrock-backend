import { z } from "zod";
import { objectIdString } from "./routeSchemas.js";

export const storeCategoryStatusEnum = z.enum(["activa", "inactiva"]);

const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "slug must be lowercase alphanumeric with optional hyphens"
  );

const storeCategoryFields = {
  name: z.string().min(1).max(300),
  slug: slugSchema,
  description: z.string().max(5000).optional(),
  status: storeCategoryStatusEnum,
  image: z.string().max(10_000_000).optional(),
};

export const createStoreCategoryBodySchema = z
  .object(storeCategoryFields)
  .passthrough();

export const updateStoreCategoryBodySchema = z
  .object({
    id: objectIdString,
    name: z.string().min(1).max(300).optional(),
    slug: slugSchema.optional(),
    description: z.string().max(5000).optional(),
    status: storeCategoryStatusEnum.optional(),
    image: z.string().max(10_000_000).optional(),
  })
  .passthrough();

export const paginateStoreCategoriesQuerySchema = z.object({
  search: z.string().max(500).optional(),
  filter: z.string().max(500).optional(),
  status: storeCategoryStatusEnum.optional(),
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

export type CreateStoreCategoryBody = z.infer<
  typeof createStoreCategoryBodySchema
>;
export type UpdateStoreCategoryBody = z.infer<
  typeof updateStoreCategoryBodySchema
>;
export type PaginateStoreCategoriesQuery = z.infer<
  typeof paginateStoreCategoriesQuerySchema
>;
