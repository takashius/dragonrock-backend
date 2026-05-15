import multer, { MulterError } from "multer";
import type { RequestHandler, Response } from "express";
import {
  isMultipartFormData,
  toDataUri,
} from "./parseUserMultipartPhoto.js";

const newsImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("image debe ser una imagen válida"));
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

export const parseNewsMultipartImage: RequestHandler = (req, res, next): void => {
  if (!isMultipartFormData(req)) {
    next();
    return;
  }

  newsImageUpload.single("image")(req, res, (error: unknown) => {
    if (error) {
      if (error instanceof MulterError && error.code === "LIMIT_FILE_SIZE") {
        sendMultipartValidationError(
          res,
          "image supera el tamaño máximo permitido (5MB)"
        );
        return;
      }
      if (error instanceof Error) {
        sendMultipartValidationError(res, error.message);
        return;
      }
      sendMultipartValidationError(res, "Error procesando multipart/form-data");
      return;
    }

    if (req.file) {
      req.body = {
        ...req.body,
        image: toDataUri({
          mimetype: req.file.mimetype,
          buffer: req.file.buffer,
        }),
      };
    }

    next();
  });
};
