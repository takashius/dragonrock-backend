import type {
  StoreOrderCustomerInput,
  StoreOrderLineItemInput,
  StoreOrderLineItemSnapshot,
} from "../types/storeOrderOutcome.js";

type AvailableProduct = {
  _id: unknown;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  stock: number;
};

export function mergeOrderLineItems(
  items: StoreOrderLineItemInput[]
): StoreOrderLineItemInput[] {
  const merged = new Map<string, number>();
  for (const item of items) {
    const current = merged.get(item.productId) ?? 0;
    merged.set(item.productId, current + item.quantity);
  }
  return [...merged.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export function buildOrderLineSnapshots(
  requestedItems: StoreOrderLineItemInput[],
  products: AvailableProduct[]
): { ok: true; items: StoreOrderLineItemSnapshot[]; subtotal: number } | { ok: false; message: string } {
  const byId = new Map(
    products.map((product) => [String(product._id), product])
  );
  const merged = mergeOrderLineItems(requestedItems);
  const snapshots: StoreOrderLineItemSnapshot[] = [];
  let subtotal = 0;

  for (const item of merged) {
    const product = byId.get(item.productId);
    if (!product) {
      return {
        ok: false,
        message: `Product not available: ${item.productId}`,
      };
    }
    if (item.quantity > product.stock) {
      return {
        ok: false,
        message: `Insufficient stock for ${product.name}`,
      };
    }
    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    snapshots.push({
      productId: item.productId,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      unitPrice: product.price,
      quantity: item.quantity,
      lineTotal,
    });
  }

  return { ok: true, items: snapshots, subtotal };
}

export function formatMoney(amount: number): string {
  return amount.toFixed(2);
}

export function asAvailableProducts(message: unknown): AvailableProduct[] {
  if (!Array.isArray(message)) {
    return [];
  }
  return message.filter(
    (row): row is AvailableProduct =>
      Boolean(row) &&
      typeof row === "object" &&
      typeof (row as AvailableProduct).name === "string" &&
      typeof (row as AvailableProduct).slug === "string" &&
      typeof (row as AvailableProduct).price === "number" &&
      typeof (row as AvailableProduct).stock === "number"
  );
}

export function asStoreOrderDoc(message: unknown): {
  orderNumber: string;
  customer: StoreOrderCustomerInput;
  items: StoreOrderLineItemSnapshot[];
  subtotal: number;
  total: number;
  notes?: string;
} | null {
  if (!message || typeof message !== "object") {
    return null;
  }
  const doc = message as Record<string, unknown>;
  const customer = doc.customer as Record<string, unknown> | undefined;
  if (
    typeof doc.orderNumber !== "string" ||
    !customer ||
    typeof customer.name !== "string" ||
    typeof customer.email !== "string" ||
    typeof customer.phone !== "string" ||
    typeof customer.address !== "string" ||
    typeof doc.subtotal !== "number" ||
    typeof doc.total !== "number" ||
    !Array.isArray(doc.items)
  ) {
    return null;
  }

  const items: StoreOrderLineItemSnapshot[] = [];
  for (const row of doc.items) {
    if (!row || typeof row !== "object") {
      continue;
    }
    const item = row as Record<string, unknown>;
    const productRef = item.product;
    const productId =
      productRef &&
      typeof productRef === "object" &&
      "_id" in (productRef as object)
        ? String((productRef as { _id: unknown })._id)
        : String(productRef ?? item.productId ?? "");
    if (
      !productId ||
      typeof item.name !== "string" ||
      typeof item.slug !== "string" ||
      typeof item.unitPrice !== "number" ||
      typeof item.quantity !== "number" ||
      typeof item.lineTotal !== "number"
    ) {
      continue;
    }
    const snapshot: StoreOrderLineItemSnapshot = {
      productId,
      name: item.name,
      slug: item.slug,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    };
    if (typeof item.sku === "string") {
      snapshot.sku = item.sku;
    }
    items.push(snapshot);
  }

  if (items.length === 0) {
    return null;
  }

  return {
    orderNumber: doc.orderNumber,
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    },
    items,
    subtotal: doc.subtotal,
    total: doc.total,
    notes: typeof doc.notes === "string" ? doc.notes : undefined,
  };
}

export function asCompanyEmail(message: unknown): string | null {
  if (!message || typeof message !== "object") {
    return null;
  }
  const row = message as Record<string, unknown>;
  return typeof row.email === "string" && row.email.trim()
    ? row.email.trim()
    : null;
}

export function asCompanyName(message: unknown): string {
  if (!message || typeof message !== "object") {
    return "DragonRock";
  }
  const row = message as Record<string, unknown>;
  return typeof row.name === "string" && row.name.trim()
    ? row.name.trim()
    : "DragonRock";
}
