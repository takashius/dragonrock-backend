import test from "node:test";
import assert from "node:assert/strict";
import type { StoreOrderRepository } from "../../../application/ports/storeOrderRepository.js";
import type { StoreProductRepository } from "../../../application/ports/storeProductRepository.js";
import type { CompanyLookup } from "../../../application/ports/companyLookup.js";
import type { MailSender } from "../../../application/ports/mailSender.js";
import type { StoreOrderOutcome } from "../../../application/types/storeOrderOutcome.js";
import { CreatePublicStoreOrderUseCase } from "../../../application/storeOrders/createPublicStoreOrderUseCase.js";
import { PaginateStoreOrdersUseCase } from "../../../application/storeOrders/paginateStoreOrdersUseCase.js";
import { GetStoreOrderDetailUseCase } from "../../../application/storeOrders/getStoreOrderDetailUseCase.js";
import { UpdateStoreOrderUseCase } from "../../../application/storeOrders/updateStoreOrderUseCase.js";

const ok: StoreOrderOutcome = { status: 200, message: [] };

function createOrderRepo(
  overrides: Partial<StoreOrderRepository> = {}
): StoreOrderRepository {
  return {
    create: async () => ok,
    paginate: async () => ok,
    getDetail: async () => ok,
    update: async () => ok,
    softDelete: async () => ok,
    ...overrides,
  } as StoreOrderRepository;
}

function createProductRepo(
  overrides: Partial<StoreProductRepository> = {}
): StoreProductRepository {
  return {
    getDetail: async () => ok,
    paginate: async () => ok,
    create: async () => ok,
    update: async () => ok,
    softDelete: async () => ok,
    listPublic: async () => ok,
    getPublicDetail: async () => ok,
    getPublicDetailBySlug: async () => ok,
    findAvailableForOrder: async () => ok,
    decrementStockForOrder: async () => ok,
    restoreStockForOrder: async () => ok,
    ...overrides,
  } as StoreProductRepository;
}

const payload = {
  customer: {
    name: "Juan Pérez",
    email: "juan@example.com",
    phone: "+584121234567",
    address: "Av. Principal 123, Caracas",
  },
  items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
};

test("CreatePublicStoreOrderUseCase: crea pedido y envía correos", async () => {
  let mailCount = 0;
  let sentFullHtml = false;
  const orders = createOrderRepo({
    async create() {
      return {
        status: 201,
        message: {
          orderNumber: "ORD-20260527-0001",
          customer: payload.customer,
          subtotal: 25,
          total: 25,
          items: [
            {
              product: "507f1f77bcf86cd799439011",
              name: "Camiseta DragonRock",
              slug: "camiseta-dragonrock",
              unitPrice: 25,
              quantity: 1,
              lineTotal: 25,
            },
          ],
        },
      };
    },
  });
  const products = createProductRepo({
    async findAvailableForOrder() {
      return {
        status: 200,
        message: [
          {
            _id: "507f1f77bcf86cd799439011",
            name: "Camiseta DragonRock",
            slug: "camiseta-dragonrock",
            price: 25,
            stock: 10,
          },
        ],
      };
    },
  });
  const companies: CompanyLookup = {
    async getCompany() {
      return {
        status: 200,
        message: {
          name: "DragonRock",
          email: "tienda@dragonrock.com",
          logo: "https://res.cloudinary.com/demo/logo.png",
        },
      };
    },
  };
  const mail: MailSender = {
    async sendTransactional(params) {
      mailCount += 1;
      if (params.fullHtmlDocument?.includes("DragonRock")) {
        sentFullHtml = true;
      }
    },
  };

  const out = await new CreatePublicStoreOrderUseCase(
    orders,
    products,
    companies,
    mail,
    "507f1f77bcf86cd799439099"
  ).execute(payload);

  assert.equal(out.status, 201);
  assert.equal(mailCount, 2);
  assert.equal(sentFullHtml, true);
});

test("CreatePublicStoreOrderUseCase: stock insuficiente no crea pedido", async () => {
  let created = false;
  const orders = createOrderRepo({
    async create() {
      created = true;
      return { status: 201, message: {} };
    },
  });
  const products = createProductRepo({
    async findAvailableForOrder() {
      return {
        status: 200,
        message: [
          {
            _id: "507f1f77bcf86cd799439011",
            name: "Camiseta",
            slug: "camiseta",
            price: 25,
            stock: 0,
          },
        ],
      };
    },
  });

  const out = await new CreatePublicStoreOrderUseCase(
    orders,
    products,
    { async getCompany() { return { status: 200, message: { email: "a@b.com" } }; } },
    { async sendTransactional() {} },
    "company-id"
  ).execute(payload);

  assert.equal(out.status, 400);
  assert.equal(created, false);
});

test("PaginateStoreOrdersUseCase delega con companyId", async () => {
  let seenCompany = "";
  const repo = createOrderRepo({
    async paginate(params) {
      seenCompany = params.companyId;
      return ok;
    },
  });
  await new PaginateStoreOrdersUseCase(repo).execute({
    search: "juan",
    filter: undefined,
    status: "pendiente",
    page: "1",
    companyId: "c1",
  });
  assert.equal(seenCompany, "c1");
});

test("GetStoreOrderDetailUseCase delega con id y empresa", async () => {
  let id = "";
  let company = "";
  const repo = createOrderRepo({
    async getDetail(a, b) {
      id = a;
      company = b;
      return ok;
    },
  });
  await new GetStoreOrderDetailUseCase(repo).execute("oid", "cid");
  assert.equal(id, "oid");
  assert.equal(company, "cid");
});

test("UpdateStoreOrderUseCase delega con id, status y empresa", async () => {
  let seenId = "";
  let seenStatus = "";
  let seenCompany = "";
  const repo = createOrderRepo({
    async update(data, companyId) {
      seenId = data.id;
      seenStatus = data.status;
      seenCompany = companyId;
      return ok;
    },
  });
  await new UpdateStoreOrderUseCase(repo).execute(
    { id: "507f1f77bcf86cd799439011", status: "enviado" },
    "c1"
  );
  assert.equal(seenId, "507f1f77bcf86cd799439011");
  assert.equal(seenStatus, "enviado");
  assert.equal(seenCompany, "c1");
});
