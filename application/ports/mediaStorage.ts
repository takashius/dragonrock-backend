import type {
  MediaDeletePayload,
  MediaUploadPayload,
} from "../types/mediaOutcome.js";

export interface MediaStorage {
  upload(input: MediaUploadPayload): Promise<{
    publicId: string;
    secureUrl: string;
    resourceType: string;
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
  }>;

  destroy(input: MediaDeletePayload): Promise<{
    publicId: string;
    result: string;
  }>;
}
