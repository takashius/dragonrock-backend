import multer, { MulterError } from "multer";
import type { RequestHandler, Response } from "express";
import {
  isMultipartFormData,
  toDataUri,
} from "./parseUserMultipartPhoto.js";
import { normalizeStoreProductMultipartBody } from "./normalizeStoreProductMultipartBody.js";

const productUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Las imágenes deben ser archivos image/* válidos"));
      return;
    }
    cb(null, true);
  },
});

function sendMultipartValidationError(res: Response, message: string): void {
  res.status(400).json({
    error: "Validación",
    issues: {
      _errors: [message],
    },
  });
}

export const parseStoreProductMultipart: RequestHandler = (
  req,
  res,
  next
): void => {
  if (!isMultipartFormData(req)) {
    next();
    return;
  }

  productUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "galleryImages", maxCount: 20 },
    { name: "galleryImages[]", maxCount: 20 },
  ])(req, res, (error: unknown) => {
    if (error) {
      if (error instanceof MulterError && error.code === "LIMIT_FILE_SIZE") {
        sendMultipartValidationError(
          res,
          "Una imagen supera el tamaño máximo permitido (5MB)"
        );
        return;
      }
      if (error instanceof MulterError && error.code === "LIMIT_UNEXPECTED_FILE") {
        sendMultipartValidationError(res, "Campo de archivo no permitido");
        return;
      }
      if (error instanceof Error) {
        sendMultipartValidationError(res, error.message);
        return;
      }
      sendMultipartValidationError(res, "Error procesando multipart/form-data");
      return;
    }

    type MulterFile = { mimetype: string; buffer: Buffer };
    const files = req.files as
      | {
          image?: MulterFile[];
          galleryImages?: MulterFile[];
          "galleryImages[]"?: MulterFile[];
        }
      | undefined;

    if (files?.image?.[0]) {
      const cover = files.image[0];
      req.body = {
        ...req.body,
        image: toDataUri({
          mimetype: cover.mimetype,
          buffer: cover.buffer,
        }),
      };
    }

    const galleryFiles = [
      ...(files?.galleryImages ?? []),
      ...(files?.["galleryImages[]"] ?? []),
    ];
    if (galleryFiles.length > 0) {
      const uploaded = galleryFiles.map((file) =>
        toDataUri({
          mimetype: file.mimetype,
          buffer: file.buffer,
        })
      );
      const existing = req.body?.galleryImages;
      const fromBracket = req.body?.["galleryImages[]"];
      const merged = [
        ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
        ...(Array.isArray(fromBracket)
          ? fromBracket
          : fromBracket
            ? [fromBracket]
            : []),
        ...uploaded,
      ];
      req.body = {
        ...req.body,
        galleryImages: merged,
      };
      delete req.body["galleryImages[]"];
    }

    if (req.body && typeof req.body === "object") {
      normalizeStoreProductMultipartBody(req.body as Record<string, unknown>);
    }

    next();
  });
};
