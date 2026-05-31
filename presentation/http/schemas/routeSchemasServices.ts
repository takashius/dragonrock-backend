import { z } from "zod";
import { objectIdString } from "./routeSchemas.js";

export const serviceCategoryEnum = z.enum([
  "desarrolloWeb",
  "disenoGrafico",
  "marketingDigital",
  "personalizacion",
  "produccionMusical",
  "fotografia",
  "otro",
]);

export const serviceStatusEnum = z.enum(["draft", "published"]);

const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "slug must be lowercase alphanumeric with optional hyphens"
  );

const tagsSchema = z.array(z.string().min(1).max(100)).max(30).optional();

const priceSchema = z.number().min(0).optional();

const serviceFields = {
  name: z.string().min(1).max(300),
  slug: slugSchema,
  category: serviceCategoryEnum,
  status: serviceStatusEnum,
  price: priceSchema,
  showPriceFrom: z.boolean().optional(),
  shortDescription: z.string().min(1).max(200),
  fullDescription: z.string().max(100000).optional(),
  image: z.string().max(10_000_000).optional(),
  contactUrl: z.string().url().max(2000).optional(),
  tags: tagsSchema,
  isFeatured: z.boolean().optional(),
};

export const createServiceBodySchema = z
  .object(serviceFields)
  .passthrough();

export const updateServiceBodySchema = z
  .object({
    id: objectIdString,
    name: z.string().min(1).max(300).optional(),
    slug: slugSchema.optional(),
    category: serviceCategoryEnum.optional(),
    status: serviceStatusEnum.optional(),
    price: priceSchema,
    showPriceFrom: z.boolean().optional(),
    shortDescription: z.string().min(1).max(200).optional(),
    fullDescription: z.string().max(100000).optional(),
    image: z.string().max(10_000_000).optional(),
    contactUrl: z.string().url().max(2000).optional(),
    tags: tagsSchema,
    isFeatured: z.boolean().optional(),
    clearPrice: z.boolean().optional(),
  })
  .passthrough();

export const paginateServicesQuerySchema = z.object({
  search: z.string().max(500).optional(),
  filter: z.string().max(500).optional(),
  category: serviceCategoryEnum.optional(),
  status: serviceStatusEnum.optional(),
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

export type CreateServiceBody = z.infer<typeof createServiceBodySchema>;
export type UpdateServiceBody = z.infer<typeof updateServiceBodySchema>;
export type PaginateServicesQuery = z.infer<typeof paginateServicesQuerySchema>;
