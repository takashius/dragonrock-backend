import type { StoreOrderRepository } from "../ports/storeOrderRepository.js";
import type { StoreProductRepository } from "../ports/storeProductRepository.js";
import type { CompanyLookup } from "../ports/companyLookup.js";
import type { MailSender } from "../ports/mailSender.js";
import type {
  StoreOrderCustomerInput,
  StoreOrderLineItemInput,
  StoreOrderOutcome,
} from "../types/storeOrderOutcome.js";
import { resolveDefaultCompanyForTransactionalMail } from "../user/resolveDefaultCompanyForTransactionalMail.js";
import {
  buildStoreOrderEmailDocument,
  buildStoreOrderPlainText,
} from "../email/buildStoreOrderEmailDocument.js";
import {
  asAvailableProducts,
  asCompanyEmail,
  asCompanyName,
  asStoreOrderDoc,
  buildOrderLineSnapshots,
} from "./storeOrderHelpers.js";

export class CreatePublicStoreOrderUseCase {
  constructor(
    private readonly orders: StoreOrderRepository,
    private readonly products: StoreProductRepository,
    private readonly companies: CompanyLookup,
    private readonly mail: MailSender,
    private readonly defaultCompanyId: string
  ) {}

  async execute(payload: {
    customer: StoreOrderCustomerInput;
    items: StoreOrderLineItemInput[];
    notes?: string;
  }): Promise<StoreOrderOutcome> {
    try {
      if (!payload.items.length) {
        return { status: 400, message: "At least one item is required" };
      }

      const productIds = payload.items.map((item) => item.productId);
      const available = await this.products.findAvailableForOrder(productIds);
      if (available.status !== 200) {
        return available;
      }

      const products = asAvailableProducts(available.message);
      const built = buildOrderLineSnapshots(payload.items, products);
      if (!built.ok) {
        return { status: 400, message: built.message };
      }

      const resolved = await resolveDefaultCompanyForTransactionalMail(
        this.companies,
        this.defaultCompanyId
      );
      if (!resolved.ok) {
        return {
          status: resolved.outcome.status,
          message: resolved.outcome.message,
          detail: resolved.outcome.detail,
        };
      }

      const companyEmail = asCompanyEmail(resolved.companyRow);
      if (!companyEmail) {
        return {
          status: 500,
          message: "Company email not configured for store orders",
        };
      }

      const stockUpdate = await this.products.decrementStockForOrder(
        built.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      );
      if (stockUpdate.status !== 200) {
        return stockUpdate;
      }

      const created = await this.orders.create({
        customer: payload.customer,
        items: built.items,
        subtotal: built.subtotal,
        total: built.subtotal,
        notes: payload.notes,
        companyId: this.defaultCompanyId,
      });
      if (created.status !== 201) {
        await this.products.restoreStockForOrder(
          built.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          }))
        );
        return created;
      }

      const orderDoc = asStoreOrderDoc(created.message);
      if (!orderDoc) {
        return {
          status: 500,
          message: "Order created but response could not be parsed",
        };
      }

      const companyName = asCompanyName(resolved.companyRow);
      const emailBase = {
        ...orderDoc,
        companyRow: resolved.companyRow,
      };
      const customerDocument = buildStoreOrderEmailDocument({
        ...emailBase,
        forCustomer: true,
      });
      const storeDocument = buildStoreOrderEmailDocument({
        ...emailBase,
        forCustomer: false,
      });
      const customerText = buildStoreOrderPlainText({
        ...emailBase,
        forCustomer: true,
      });
      const storeText = buildStoreOrderPlainText({
        ...emailBase,
        forCustomer: false,
      });

      try {
        await Promise.all([
          this.mail.sendTransactional({
            config: resolved.companyRow,
            toEmail: orderDoc.customer.email,
            toName: orderDoc.customer.name,
            subject: `Pedido recibido — ${orderDoc.orderNumber}`,
            title: "Confirmación de pedido DragonRock",
            htmlMessage: customerText,
            fullHtmlDocument: customerDocument,
            textMessage: customerText,
          }),
          this.mail.sendTransactional({
            config: resolved.companyRow,
            toEmail: companyEmail,
            toName: companyName,
            subject: `Nuevo pedido — ${orderDoc.orderNumber}`,
            title: "Nuevo pedido en la tienda",
            htmlMessage: storeText,
            fullHtmlDocument: storeDocument,
            textMessage: storeText,
          }),
        ]);
      } catch (mailError: unknown) {
        console.log("[WARN] -> createPublicStoreOrder emails failed", mailError);
      }

      return created;
    } catch (e: unknown) {
      console.log("[ERROR] -> createPublicStoreOrder", e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
