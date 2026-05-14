import { v2 as cloudinary } from "cloudinary";
import type { MediaStorage } from "../../application/ports/mediaStorage.js";
import type {
  MediaDeletePayload,
  MediaUploadPayload,
} from "../../application/types/mediaOutcome.js";

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  defaultFolder: string;
};

export class CloudinaryMediaStorage implements MediaStorage {
  constructor(private readonly cfg: CloudinaryConfig) {
    cloudinary.config({
      cloud_name: cfg.cloudName,
      api_key: cfg.apiKey,
      api_secret: cfg.apiSecret,
      secure: true,
    });
  }

  async upload(input: MediaUploadPayload): Promise<{
    publicId: string;
    secureUrl: string;
    resourceType: string;
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
  }> {
    const response = await cloudinary.uploader.upload(input.source, {
      folder: input.folder || this.cfg.defaultFolder,
      public_id: input.publicId,
      resource_type: input.resourceType || "image",
      overwrite: true,
    });

    return {
      publicId: response.public_id,
      secureUrl: response.secure_url,
      resourceType: response.resource_type,
      format: response.format,
      bytes: response.bytes,
      width: response.width,
      height: response.height,
    };
  }

  async destroy(input: MediaDeletePayload): Promise<{
    publicId: string;
    result: string;
  }> {
    const response = await cloudinary.uploader.destroy(input.publicId, {
      resource_type: input.resourceType || "image",
    });

    return {
      publicId: input.publicId,
      result: response.result ?? "unknown",
    };
  }
}
