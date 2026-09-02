import type { PublicNewsCommentDto } from "../types/newsCommentOutcome.js";

function asIsoDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return new Date().toISOString();
}

export function mapNewsCommentDto(doc: {
  _id: unknown;
  authorName?: unknown;
  body?: unknown;
  createdAt?: unknown;
}): PublicNewsCommentDto {
  return {
    _id: String(doc._id),
    authorName: typeof doc.authorName === "string" ? doc.authorName : "",
    body: typeof doc.body === "string" ? doc.body : "",
    createdAt: asIsoDate(doc.createdAt),
  };
}
