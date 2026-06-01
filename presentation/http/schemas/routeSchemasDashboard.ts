import { z } from "zod";

export const dashboardQuerySchema = z.object({
  recentItemsLimit: z
    .string()
    .regex(/^\d+$/)
    .max(2)
    .optional(),
  outOfStockLimit: z
    .string()
    .regex(/^\d+$/)
    .max(2)
    .optional(),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;

export const DEFAULT_RECENT_ITEMS_LIMIT = 20;
export const DEFAULT_OUT_OF_STOCK_LIMIT = 10;
export const MAX_RECENT_ITEMS_LIMIT = 50;
export const MAX_OUT_OF_STOCK_LIMIT = 30;
