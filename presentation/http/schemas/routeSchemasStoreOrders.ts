import { z } from "zod";
import { objectIdString } from "./routeSchemas.js";

export const storeOrderStatusEnum = z.enum([
  "pendiente",
  "confirmado",
  "enviado",
  "cancelado",
]);

const orderCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().min(3).max(50),
  address: z.string().min(5).max(1000),
});

const orderItemSchema = z.object({
  productId: objectIdString,
  quantity: z.number().int().min(1).max(999),
});

export const createPublicStoreOrderBodySchema = z.object({
  customer: orderCustomerSchema,
  items: z.array(orderItemSchema).min(1).max(50),
  notes: z.string().max(2000).optional(),
});

export const paginateStoreOrdersQuerySchema = z.object({
  search: z.string().max(500).optional(),
  filter: z.string().max(500).optional(),
  status: storeOrderStatusEnum.optional(),
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

export type CreatePublicStoreOrderBody = z.infer<
  typeof createPublicStoreOrderBodySchema
>;
export type PaginateStoreOrdersQuery = z.infer<
  typeof paginateStoreOrdersQuerySchema
>;

export const updateStoreOrderBodySchema = z.object({
  id: objectIdString,
  status: storeOrderStatusEnum,
});

export type UpdateStoreOrderBody = z.infer<typeof updateStoreOrderBodySchema>;
