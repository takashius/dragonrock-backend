import { z } from "zod";

const objectIdString = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "id inválido");
const userRoleEnum = z.enum(["Administrador", "Editor", "Autor"]);

/** ObjectId de MongoDB (24 hex). */
export const mongoIdParamSchema = z.object({
  id: objectIdString,
});

export const recoveryEmailParamSchema = z.object({
  email: z.string().min(3).max(320).email(),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerPublicBodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8).max(500),
  companyName: z.string().min(1).max(200),
  docId: z.string().min(1).max(100),
  phone: z.string().max(50).optional(),
});

export const recoveryRequestBodySchema = z.object({
  email: z.string().email(),
});

export const recoveryStepTwoBodySchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(32),
  newPass: z.string().min(8).max(500),
});

export const addUserBodySchema = z
  .object({
    name: z.string().min(1).max(200),
    lastname: z.string().min(1).max(200),
    email: z.string().email(),
    password: z.string().min(8).max(500),
    role: userRoleEnum.optional(),
    phone: z.string().max(50).optional(),
    photo: z.string().max(10_000_000).optional(),
  })
  .passthrough();

export const updateUserBodySchema = z.object({
  id: objectIdString,
  name: z.string().min(1).max(200).optional(),
  lastname: z.string().min(1).max(200).optional(),
  role: userRoleEnum.optional(),
  photo: z.string().max(10_000_000).optional(),
  phone: z.string().max(50).optional(),
  password: z.string().min(8).max(500).optional(),
});

export const changePasswordBodySchema = z.object({
  password: z.string().min(8).max(500),
});

export const companyIdBodySchema = z.object({
  company: objectIdString,
});

export const addCompanyBodySchema = z.object({
  user: objectIdString,
  company: objectIdString,
});

const newsTypeEnum = z.enum(["escenaRock", "culturales", "other"]);
const newsStatusEnum = z.enum(["draft", "published", "archived"]);
const mediaResourceTypeEnum = z.enum(["image", "video", "raw", "auto"]);
const mediaDestroyResourceTypeEnum = z.enum(["image", "video", "raw"]);

export const createNewsBodySchema = z
  .object({
    title: z.string().min(1).max(500),
    description: z.string().max(10000).optional(),
    content: z.string().max(100000).optional(),
    type: newsTypeEnum,
    status: newsStatusEnum,
    image: z.string().max(10_000_000).optional(),
    tags: z.array(z.string().max(100)).max(50).optional(),
  })
  .passthrough();

export const updateNewsBodySchema = z
  .object({
    id: objectIdString,
    title: z.string().min(1).max(500).optional(),
    description: z.string().max(10000).optional(),
    content: z.string().max(100000).optional(),
    type: newsTypeEnum.optional(),
    status: newsStatusEnum.optional(),
    image: z.string().max(10_000_000).optional(),
    tags: z.array(z.string().max(100)).max(50).optional(),
  })
  .passthrough();

export const paginateNewsQuerySchema = z.object({
  search: z.string().max(500).optional(),
  filter: z.string().max(500).optional(),
  type: newsTypeEnum.optional(),
  page: z
    .string()
    .regex(/^\d+$/)
    .max(10)
    .optional(),
});

export const uploadMediaBodySchema = z.object({
  source: z.string().min(1).max(5_000_000),
  folder: z.string().min(1).max(200).optional(),
  publicId: z.string().min(1).max(500).optional(),
  resourceType: mediaResourceTypeEnum.optional(),
});

export const deleteMediaBodySchema = z.object({
  publicId: z.string().min(1).max(500),
  resourceType: mediaDestroyResourceTypeEnum.optional(),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
export type RegisterPublicBody = z.infer<typeof registerPublicBodySchema>;
export type RecoveryRequestBody = z.infer<typeof recoveryRequestBodySchema>;
export type RecoveryStepTwoBody = z.infer<typeof recoveryStepTwoBodySchema>;
export type AddUserBody = z.infer<typeof addUserBodySchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;
export type CompanyIdBody = z.infer<typeof companyIdBodySchema>;
export type AddCompanyBody = z.infer<typeof addCompanyBodySchema>;
export type CreateNewsBody = z.infer<typeof createNewsBodySchema>;
export type UpdateNewsBody = z.infer<typeof updateNewsBodySchema>;
export type PaginateNewsQuery = z.infer<typeof paginateNewsQuerySchema>;
export type UploadMediaBody = z.infer<typeof uploadMediaBodySchema>;
export type DeleteMediaBody = z.infer<typeof deleteMediaBodySchema>;
