import user from "./documentation/user.js";
import company from "./documentation/company.js";
import product from "./documentation/products.js";
import customer from "./documentation/customer.js";
import cotiza from "./documentation/cotiza.js";

const definition = {
  swagger: "2.0",
  info: {
    version: "2.0.0",
    title: "Cotizador API",
    description: "API for cotizador",
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  host: "localhost:8080",

  servers: [
    {
      url: "localhost:8080",
      description: "Local server",
    },
  ],

  tags: [
    {
      name: "Users",
      description: "User management",
    },
    {
      name: "Company",
      description: "Company users",
    },
    {
      name: "Product",
      description: "Product companies",
    },
    {
      name: "Customer",
      description: "Customer companies",
    },
    {
      name: "Cotizacion",
      description: "Cotizacion companies",
    },
  ],
  consumes: ["application/json"],
  produces: ["application/json"],
  paths: {
    "/user/login": user.login,
    "/user/logout": user.logout,
    "/user": user.create,
    "/user ": user.update,
    "/user  ": user.list,
    "/user/{id}": user.userByID,
    "/user/account": user.account,
    "/user/change_password": user.changePassword,
    "/user/add_company": user.addCompany,
    "/user/select_company": user.selectCompany,
    "/user/del_company": user.removeCompany,
    "/company": company.create,
    "/company ": company.update,
    "/company  ": company.list,
    "/company/{id}": company.companyByID,
    "/company/{id} ": company.deleted,
    "/product": product.create,
    "/product ": product.update,
    "/product  ": product.list,
    "/product/{id}": product.productByID,
    "/product/{id} ": product.deleted,
    "/customer": customer.create,
    "/customer ": customer.update,
    "/customer  ": customer.list,
    "/customer/{id}": customer.customerByID,
    "/customer/{id} ": customer.deleted,
    "/customer/address": customer.addAddress,
    "/customer/address ": customer.updateAddress,
    "/customer/address  ": customer.deleteAddress,
    "/customer/address/default": customer.setAddressDefault,
    "/cotiza": cotiza.create,
    "/cotiza ": cotiza.update,
    "/cotiza  ": cotiza.list,
    "/cotiza/{id}": cotiza.cotizaByID,
    "/cotiza/{id} ": cotiza.deleted,
    "/cotiza/product": cotiza.addProduct,
    "/cotiza/product ": cotiza.updateProduct,
    "/cotiza/product  ": cotiza.deleteProduct,
  },
  definitions: {
    User: user.definitions.User,
    Users: user.definitions.Users,
    ResponseUserLoginData: user.definitions.ResponseUserLoginData,
    ResponseUserData: user.definitions.ResponseUserData,
    Company: company.definitions.Company,
    CreatedCompany: company.definitions.CreatedCompany,
    ListCompany: company.definitions.ListCompany,
    Product: product.definitions.Product,
    CreatedProduct: product.definitions.CreatedProduct,
    ListProducts: product.definitions.ListProducts,
    Customer: customer.definitions.Customer,
    CreatedCustomer: customer.definitions.CreatedCustomer,
    ListCustomers: customer.definitions.ListCustomers,
    Addresses: customer.definitions.Addresses,
    AddressBase: customer.definitions.AddressBase,
    Cotizacion: cotiza.definitions.Cotizacion,
    CreatedCotiza: cotiza.definitions.CreatedCotiza,
    ListCotiza: cotiza.definitions.ListCotiza,
    ProductsCotiza: cotiza.definitions.ProductsCotiza,
    ProductsBase: cotiza.definitions.ProductsBase,
  },
};

export default definition;
