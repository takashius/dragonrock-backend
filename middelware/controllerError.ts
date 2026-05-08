import type { Request, Response } from "express";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

const handleDuplicateKeyError = (err: Record<string, unknown>, res: Response): void => {
  const kv = err.keyValue as Record<string, unknown> | undefined;
  const field = kv ? Object.keys(kv)[0] ?? "field" : "field";
  const errors: Record<string, string> = {};
  errors[field] = `An account with that ${field} already exists.`;
  res.status(400).send(errors);
};

const handleValidationError = (err: Record<string, unknown>, res: Response): void => {
  const rawErrors = err.errors as Record<string, { message: string }>;
  const errors: Record<string, string> = {};
  Object.keys(rawErrors).forEach((key) => {
    errors[key] = rawErrors[key].message;
  });
  res.status(400).send(errors);
};

export default (err: unknown, _req: Request, res: Response): void => {
  try {
    console.log("congrats you hit the error middleware", err);
    if (isRecord(err) && err.name === "ValidationError") {
      handleValidationError(err, res);
      return;
    }
    if (isRecord(err) && err.code === 11000) {
      handleDuplicateKeyError(err, res);
      return;
    }
    throw new Error("error");
  } catch {
    console.log("error");
    res.status(500).send("An unknown error occured.");
  }
};
