import mongoose from "mongoose";
import StoreCategory from "./mongoose/storeCategoryModel.js";

const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

/** Resuelve filtro de categoría por ObjectId o slug (solo categorías activas públicas). */
export async function resolvePublicActiveCategoryId(
  categoryFilter: string
): Promise<mongoose.Types.ObjectId | null> {
  const trimmed = categoryFilter.trim();
  if (!trimmed) {
    return null;
  }

  const baseQuery = { active: true, status: "activa" as const };

  if (OBJECT_ID_PATTERN.test(trimmed)) {
    const found = await StoreCategory.findOne({
      ...baseQuery,
      _id: trimmed,
    })
      .select("_id")
      .lean();
    return found?._id ? new mongoose.Types.ObjectId(String(found._id)) : null;
  }

  const found = await StoreCategory.findOne({
    ...baseQuery,
    slug: trimmed.toLowerCase(),
  })
    .select("_id")
    .lean();
  return found?._id ? new mongoose.Types.ObjectId(String(found._id)) : null;
}

export async function listPublicActiveCategoryIds(): Promise<
  mongoose.Types.ObjectId[]
> {
  const rows = await StoreCategory.find({
    active: true,
    status: "activa",
  })
    .select("_id")
    .lean();
  return rows.map((row) => new mongoose.Types.ObjectId(String(row._id)));
}
