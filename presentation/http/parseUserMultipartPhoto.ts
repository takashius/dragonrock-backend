import multer, { MulterError } from "multer";
import type { Request, RequestHandler, Response } from "express";

const userPhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("photo debe ser una imagen válida"));
      return;
    }
    cb(null, true);
  },
});

export function isMultipartFormData(req: Request): boolean {
  const contentType = req.headers["content-type"];
  if (Array.isArray(contentType)) {
    return contentType.some((value) => value.includes("multipart/form-data"));
  }
  return (
    typeof contentType === "string" &&
    contentType.includes("multipart/form-data")
  );
}

export function toDataUri(input: { mimetype: string; buffer: Buffer }): string {
  const base64 = input.buffer.toString("base64");
  return `data:${input.mimetype};base64,${base64}`;
}

function sendMultipartValidationError(res: Response, message: string): void {
  res.status(400).json({
    error: "Validación",
    issues: {
      _errors: [message],
    },
  });
}

export const parseUserMultipartPhoto: RequestHandler = (req, res, next): void => {
  if (!isMultipartFormData(req)) {
    next();
    return;
  }

  userPhotoUpload.single("photo")(req, res, (error: unknown) => {
    if (error) {
      if (error instanceof MulterError && error.code === "LIMIT_FILE_SIZE") {
        sendMultipartValidationError(
          res,
          "photo supera el tamaño máximo permitido (5MB)"
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
        photo: toDataUri({
          mimetype: req.file.mimetype,
          buffer: req.file.buffer,
        }),
      };
    }

    next();
  });
};
