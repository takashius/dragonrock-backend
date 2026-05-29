import { z } from "zod";
import { objectIdString } from "./routeSchemas.js";

const multimediaTypeEnum = z.enum(["video", "podcast", "gallery"]);
const multimediaStatusEnum = z.enum(["draft", "published"]);

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

const galleryImagesSchema = z
  .array(z.string().max(10_000_000))
  .max(20)
  .optional();

const existingGallerySchema = z.array(z.string().url()).max(20).optional();

const baseMultimediaFields = {
  title: z.string().min(1).max(300),
  type: multimediaTypeEnum,
  status: multimediaStatusEnum,
  date: dateString,
  durationOrQuantity: z.string().max(200).optional(),
  description: z.string().max(100000).optional(),
  image: z.string().max(10_000_000).optional(),
  isFeatured: z.boolean().optional(),
  videoUrl: z.string().url().max(2000).optional(),
  season: z.number().int().min(0).optional(),
  episode: z.number().int().min(0).optional(),
  podcastUrl: z.string().url().max(2000).optional(),
  galleryImages: galleryImagesSchema,
};

function refineMultimediaByType(
  data: Record<string, unknown>,
  ctx: z.RefinementCtx,
  mode: "create" | "update"
): void {
  const type = data.type as string | undefined;
  if (!type) {
    return;
  }

  if (type === "video") {
    if (mode === "create" && !data.videoUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "videoUrl is required for video content",
        path: ["videoUrl"],
      });
    }
    if (data.season !== undefined || data.episode !== undefined || data.podcastUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Podcast fields are not allowed for video content",
      });
    }
    if (
      data.galleryImages &&
      Array.isArray(data.galleryImages) &&
      data.galleryImages.length > 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "galleryImages are not allowed for video content",
      });
    }
  }

  if (type === "podcast") {
    if (mode === "create") {
      if (data.season === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "season is required for podcast content",
          path: ["season"],
        });
      }
      if (data.episode === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "episode is required for podcast content",
          path: ["episode"],
        });
      }
      if (!data.podcastUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "podcastUrl is required for podcast content",
          path: ["podcastUrl"],
        });
      }
    }
    if (data.videoUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "videoUrl is not allowed for podcast content",
      });
    }
    if (
      data.galleryImages &&
      Array.isArray(data.galleryImages) &&
      data.galleryImages.length > 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "galleryImages are not allowed for podcast content",
      });
    }
  }

  if (type === "gallery") {
    if (mode === "create") {
      const gallery = data.galleryImages;
      if (!Array.isArray(gallery) || gallery.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one galleryImages entry is required for gallery content",
          path: ["galleryImages"],
        });
      }
    }
    if (mode === "update" && data.type === "gallery") {
      const hasExisting =
        Array.isArray(data.existingGallery) && data.existingGallery.length > 0;
      const hasNew =
        Array.isArray(data.galleryImages) && data.galleryImages.length > 0;
      if (
        (data.existingGallery !== undefined || data.galleryImages !== undefined) &&
        !hasExisting &&
        !hasNew
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Gallery update requires existingGallery and/or galleryImages",
        });
      }
    }
    if (data.videoUrl || data.podcastUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Video/podcast URLs are not allowed for gallery content",
      });
    }
  }
}

export const createMultimediaBodySchema = z
  .object(baseMultimediaFields)
  .passthrough()
  .superRefine((data, ctx) => {
    refineMultimediaByType(data as Record<string, unknown>, ctx, "create");
  });

export const updateMultimediaBodySchema = z
  .object({
    id: objectIdString,
    title: z.string().min(1).max(300).optional(),
    type: multimediaTypeEnum.optional(),
    status: multimediaStatusEnum.optional(),
    date: dateString.optional(),
    durationOrQuantity: z.string().max(200).optional(),
    description: z.string().max(100000).optional(),
    image: z.string().max(10_000_000).optional(),
    isFeatured: z.boolean().optional(),
    videoUrl: z.string().url().max(2000).optional(),
    season: z.number().int().min(0).optional(),
    episode: z.number().int().min(0).optional(),
    podcastUrl: z.string().url().max(2000).optional(),
    galleryImages: galleryImagesSchema,
    existingGallery: existingGallerySchema,
  })
  .passthrough()
  .superRefine((data, ctx) => {
    refineMultimediaByType(data as Record<string, unknown>, ctx, "update");
  });

export const paginateMultimediaQuerySchema = z.object({
  search: z.string().max(500).optional(),
  filter: z.string().max(500).optional(),
  type: multimediaTypeEnum.optional(),
  status: multimediaStatusEnum.optional(),
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

export type CreateMultimediaBody = z.infer<typeof createMultimediaBodySchema>;
export type UpdateMultimediaBody = z.infer<typeof updateMultimediaBodySchema>;
export type PaginateMultimediaQuery = z.infer<
  typeof paginateMultimediaQuerySchema
>;
