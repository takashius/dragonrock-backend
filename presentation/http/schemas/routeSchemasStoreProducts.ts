import { z } from "zod";
import { objectIdString } from "./routeSchemas.js";

export const storeProductStatusEnum = z.enum(["activo", "inactivo", "agotado"]);

const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "slug must be lowercase alphanumeric with optional hyphens"
  );

const tagsSchema = z.array(z.string().min(1).max(100)).max(30).optional();

const galleryImagesSchema = z
  .array(z.string().max(10_000_000))
  .max(20)
  .optional();

const existingGallerySchema = z.array(z.string().url()).max(20).optional();

const priceSchema = z.number().min(0);
const stockSchema = z.number().int().min(0);

const storeProductFields = {
  name: z.string().min(1).max(300),
  slug: slugSchema,
  category: objectIdString,
  status: storeProductStatusEnum,
  price: priceSchema,
  compareAtPrice: priceSchema.optional(),
  stock: stockSchema,
  sku: z.string().max(100).optional(),
  description: z.string().max(100000).optional(),
  image: z.string().max(10_000_000).optional(),
  isFeatured: z.boolean().optional(),
  tags: tagsSchema,
  galleryImages: galleryImagesSchema,
};

export const createStoreProductBodySchema = z
  .object({
    ...storeProductFields,
    image: z.string().min(1).max(10_000_000),
  })
  .passthrough();

export const updateStoreProductBodySchema = z
  .object({
    id: objectIdString,
    name: z.string().min(1).max(300).optional(),
    slug: slugSchema.optional(),
    category: objectIdString.optional(),
    status: storeProductStatusEnum.optional(),
    price: priceSchema.optional(),
    compareAtPrice: priceSchema.optional(),
    stock: stockSchema.optional(),
    sku: z.string().max(100).optional(),
    description: z.string().max(100000).optional(),
    image: z.string().max(10_000_000).optional(),
    isFeatured: z.boolean().optional(),
    tags: tagsSchema,
    galleryImages: galleryImagesSchema,
    existingGallery: existingGallerySchema,
    clearCompareAtPrice: z.boolean().optional(),
  })
  .passthrough();

export const paginateStoreProductsQuerySchema = z.object({
  search: z.string().max(500).optional(),
  filter: z.string().max(500).optional(),
  category: objectIdString.optional(),
  status: storeProductStatusEnum.optional(),
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

export type CreateStoreProductBody = z.infer<typeof createStoreProductBodySchema>;
export type UpdateStoreProductBody = z.infer<typeof updateStoreProductBodySchema>;
export type PaginateStoreProductsQuery = z.infer<
  typeof paginateStoreProductsQuerySchema
>;

export const listPublicStoreProductsQuerySchema = z.object({
  search: z.string().max(500).optional(),
  category: z.string().min(1).max(200).optional(),
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

export const productSlugParamSchema = z.object({
  slug: slugSchema,
});

export type ListPublicStoreProductsQuery = z.infer<
  typeof listPublicStoreProductsQuerySchema
>;
