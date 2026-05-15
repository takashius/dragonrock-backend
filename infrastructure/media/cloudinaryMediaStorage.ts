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

  async destroyByUrl(
    url: string
  ): Promise<{ publicId: string; result: string } | null> {
    const publicId = this.extractPublicIdFromUrl(url);
    if (!publicId) {
      return null;
    }
    return this.destroy({ publicId, resourceType: "image" });
  }

  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      if (!parsed.hostname.includes("res.cloudinary.com")) {
        return null;
      }
      const cloudSegment = `/res.cloudinary.com/${this.cfg.cloudName}/`;
      if (!parsed.pathname.includes(cloudSegment)) {
        return null;
      }

      const uploadMarker = "/upload/";
      const markerIndex = parsed.pathname.indexOf(uploadMarker);
      if (markerIndex === -1) {
        return null;
      }

      const afterUpload = parsed.pathname.slice(markerIndex + uploadMarker.length);
      const segments = afterUpload.split("/").filter(Boolean);
      if (segments.length === 0) {
        return null;
      }

      const versionIndex = segments.findIndex((part) => /^v\d+$/.test(part));
      const publicSegments =
        versionIndex >= 0 ? segments.slice(versionIndex + 1) : segments;
      if (publicSegments.length === 0) {
        return null;
      }

      const last = publicSegments[publicSegments.length - 1];
      publicSegments[publicSegments.length - 1] = last.replace(/\.[^.]+$/, "");
      return publicSegments.join("/");
    } catch {
      return null;
    }
  }
}
