import type { Router } from "express";
import config from "../config.js";
import { MongooseCompanyLookup } from "../infrastructure/company/mongooseCompanyLookup.js";
import { MailjetMailSender } from "../infrastructure/email/mailjetMailSender.js";
import { SubmitPublicContactUseCase } from "../application/contact/submitPublicContactUseCase.js";
import { createContactRouter } from "../presentation/http/contactRouter.js";

export function wireContactRouter(): Router {
  const companyLookup = new MongooseCompanyLookup();
  const mailSender = new MailjetMailSender();
  const defaultCompanyId = config.companyDefault ?? "";

  return createContactRouter({
    submitPublicContact: new SubmitPublicContactUseCase(
      companyLookup,
      mailSender,
      defaultCompanyId
    ),
  });
}
