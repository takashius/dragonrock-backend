import { z } from "zod";
import { objectIdString } from "./routeSchemas.js";

const liveEventTypeEnum = z.enum(["concierto", "festival", "cultural", "otro"]);
const liveEventStatusEnum = z.enum([
  "upcoming",
  "ongoing",
  "finished",
  "cancelled",
]);

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");
const timeString = z.string().regex(/^\d{2}:\d{2}$/, "time must be HH:mm");

const latitudeSchema = z.number().min(-90).max(90).optional();
const longitudeSchema = z.number().min(-180).max(180).optional();

const priceSchema = z.number().min(0).optional();

export const createLiveEventBodySchema = z
  .object({
    name: z.string().min(1).max(300),
    type: liveEventTypeEnum,
    status: liveEventStatusEnum,
    date: dateString,
    time: timeString,
    place: z.string().min(1).max(300),
    address: z.string().max(500).optional(),
    latitude: latitudeSchema,
    longitude: longitudeSchema,
    price: priceSchema,
    description: z.string().max(100000).optional(),
    image: z.string().max(10_000_000).optional(),
    isFeatured: z.boolean().optional(),
  })
  .passthrough();

export const updateLiveEventBodySchema = z
  .object({
    id: objectIdString,
    name: z.string().min(1).max(300).optional(),
    type: liveEventTypeEnum.optional(),
    status: liveEventStatusEnum.optional(),
    date: dateString.optional(),
    time: timeString.optional(),
    place: z.string().min(1).max(300).optional(),
    address: z.string().max(500).optional(),
    latitude: latitudeSchema,
    longitude: longitudeSchema,
    price: priceSchema,
    description: z.string().max(100000).optional(),
    image: z.string().max(10_000_000).optional(),
    isFeatured: z.boolean().optional(),
  })
  .passthrough();

export const paginateLiveEventsQuerySchema = z.object({
  search: z.string().max(500).optional(),
  filter: z.string().max(500).optional(),
  type: liveEventTypeEnum.optional(),
  status: liveEventStatusEnum.optional(),
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

export type CreateLiveEventBody = z.infer<typeof createLiveEventBodySchema>;
export type UpdateLiveEventBody = z.infer<typeof updateLiveEventBodySchema>;
export type PaginateLiveEventsQuery = z.infer<
  typeof paginateLiveEventsQuerySchema
>;
