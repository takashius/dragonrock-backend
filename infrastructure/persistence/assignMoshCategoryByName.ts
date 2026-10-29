import mongoose from "mongoose";
import LiveEvent from "./mongoose/liveEventModel.js";

const MIGRATION_ID = "assign-mosh-category-by-name";

/**
 * Pasa a la categoría `mosh` los eventos cuyo nombre ya la indica.
 * Corre una sola vez: un cambio posterior de categoría no se revierte al reiniciar.
 */
export async function assignMoshCategoryByNameOnce(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) {
    return;
  }

  const migrations = db.collection<{ name: string; at: Date; matched: number; modified: number }>(
    "app_migrations",
  );
  const already = await migrations.findOne({ name: MIGRATION_ID });
  if (already) {
    return;
  }

  const result = await LiveEvent.updateMany(
    { name: { $regex: "mosh", $options: "i" }, type: { $ne: "mosh" } },
    { $set: { type: "mosh" } },
  );

  await migrations.insertOne({
    name: MIGRATION_ID,
    at: new Date(),
    matched: result.matchedCount,
    modified: result.modifiedCount,
  });

  console.log(
    `[live-events] categoría mosh asignada a ${result.modifiedCount} evento(s) por el nombre`,
  );
}
