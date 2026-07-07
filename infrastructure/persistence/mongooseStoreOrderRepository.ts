import StoreOrder from "./mongoose/storeOrderModel.js";
import type { StoreOrderRepository } from "../../application/ports/storeOrderRepository.js";
import type { StoreOrderOutcome } from "../../application/types/storeOrderOutcome.js";
import type { StoreOrderStatus } from "../../application/types/storeOrderOutcome.js";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatOrderNumber(date: Date, sequence: number): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const seq = String(sequence).padStart(4, "0");
  return `ORD-${y}${m}${d}-${seq}`;
}

async function generateOrderNumber(now: Date): Promise<string> {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const countToday = await StoreOrder.countDocuments({
    "created.date": { $gte: startOfDay, $lte: endOfDay },
  });
  return formatOrderNumber(now, countToday + 1);
}

export class MongooseStoreOrderRepository implements StoreOrderRepository {
  async create(params: {
    customer: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    items: {
      productId: string;
      name: string;
      slug: string;
      sku?: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }[];
    subtotal: number;
    total: number;
    notes?: string;
    companyId: string;
  }): Promise<StoreOrderOutcome> {
    try {
      const orderNumber = await generateOrderNumber(new Date());
      const doc = new StoreOrder({
        orderNumber,
        customer: params.customer,
        items: params.items.map((item) => ({
          product: item.productId,
          name: item.name,
          slug: item.slug,
          sku: item.sku,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
        subtotal: params.subtotal,
        total: params.total,
        notes: params.notes,
        company: params.companyId,
        status: "pendiente",
      });
      const result = await doc.save();
      return { status: 201, message: result };
    } catch (e) {
      console.log("[ERROR] -> createStoreOrder", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async paginate(params: {
    search?: string;
    filter: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<StoreOrderOutcome> {
    try {
      const defaultLimit = 20;
      const maxLimit = 100;
      const searchText =
        params.search !== undefined && params.search !== null
          ? String(params.search).trim()
          : params.filter === undefined || params.filter === null
            ? ""
            : String(params.filter).trim();

      const query: Record<string, unknown> = {
        active: true,
        company: params.companyId,
      };

      if (
        params.status !== undefined &&
        params.status !== null &&
        String(params.status).trim()
      ) {
        query.status = String(params.status).trim();
      }

      if (searchText) {
        const regex = { $regex: escapeRegex(searchText), $options: "i" };
        query.$or = [
          { orderNumber: regex },
          { "customer.name": regex },
          { "customer.email": regex },
          { "customer.phone": regex },
          { "items.name": regex },
          { "items.sku": regex },
        ];
      }

      const pageNum = Math.max(1, parseInt(String(params.page), 10) || 1);
      const requestedLimit =
        params.pageSize === undefined || params.pageSize === null
          ? defaultLimit
          : parseInt(String(params.pageSize), 10);
      const limit =
        Number.isFinite(requestedLimit) && requestedLimit > 0
          ? Math.min(requestedLimit, maxLimit)
          : defaultLimit;

      const result = await StoreOrder.find(query)
        .select(
          "orderNumber customer items subtotal total status notes created"
        )
        .limit(limit)
        .skip((pageNum - 1) * limit)
        .sort({ "created.date": -1 });

      const total = await StoreOrder.countDocuments(query);
      const totalPages = Math.ceil(total / limit);
      const next = (): number | null => {
        if (totalPages > pageNum) {
          return pageNum + 1;
        }
        return null;
      };

      return {
        status: 200,
        message: {
          results: result,
          totalOrders: total,
          totalPages,
          currentPage: pageNum,
          pageSize: limit,
          next: next(),
        },
      };
    } catch (e) {
      console.log("[ERROR] -> paginateStoreOrders", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async getDetail(id: string, companyId: string): Promise<StoreOrderOutcome> {
    try {
      if (!id?.trim()) {
        return { status: 400, message: "Order id is required" };
      }
      const result = await StoreOrder.findOne({
        _id: id,
        active: true,
        company: companyId,
      }).populate({
        path: "items.product",
        select: ["name", "slug", "sku", "featuredImage"],
        model: "StoreProduct",
      });
      if (!result) {
        return { status: 404, message: "Order not found" };
      }
      return { status: 200, message: result };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid order id" };
      }
      console.log("[ERROR] -> getStoreOrderDetail", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async update(
    data: { id: string; status: StoreOrderStatus },
    companyId: string
  ): Promise<StoreOrderOutcome> {
    try {
      const found = await StoreOrder.findOne({
        _id: data.id,
        active: true,
        company: companyId,
      });
      if (!found) {
        return { status: 404, message: "Order not found" };
      }
      found.status = data.status;
      const result = await found.save();
      return { status: 200, message: result };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid order id" };
      }
      console.log("[ERROR] -> updateStoreOrder", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async softDelete(id: string, companyId: string): Promise<StoreOrderOutcome> {
    try {
      const found = await StoreOrder.findOne({
        _id: id,
        company: companyId,
      });
      if (!found) {
        return { status: 400, message: "Order not found" };
      }
      found.active = false;
      await found.save();
      return {
        status: 200,
        message: { text: "Order deleted successfully" },
      };
    } catch (e) {
      console.log("[ERROR] -> deleteStoreOrder", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }
}
