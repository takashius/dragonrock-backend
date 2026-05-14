export type MediaOutcome = {
  status: number;
  message: unknown;
  detail?: unknown;
};

export type MediaUploadPayload = {
  source: string;
  folder?: string;
  publicId?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
};

export type MediaDeletePayload = {
  publicId: string;
  resourceType?: "image" | "video" | "raw";
};
