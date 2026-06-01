import type { Router } from "express";
import { MongoosePublicHomeRepository } from "../infrastructure/persistence/mongoosePublicHomeRepository.js";
import { GetPublicHomeUseCase } from "../application/publicHome/getPublicHomeUseCase.js";
import { createPublicHomeRouter } from "../presentation/http/publicHomeRouter.js";

/** Rutas públicas sin autenticación. */
export function wirePublicHomeRouter(): Router {
  const repository = new MongoosePublicHomeRepository();
  return createPublicHomeRouter({
    getPublicHome: new GetPublicHomeUseCase(repository),
  });
}
