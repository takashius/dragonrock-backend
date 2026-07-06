import user from "./documentation/user.js";
import news from "./documentation/news.js";
import entrepreneurship from "./documentation/entrepreneurship.js";
import liveEvents from "./documentation/liveEvents.js";
import multimedia from "./documentation/multimedia.js";
import services from "./documentation/services.js";
import storeCategories from "./documentation/storeCategories.js";
import storeProducts from "./documentation/storeProducts.js";
import dashboard from "./documentation/dashboard.js";
import publicHome from "./documentation/publicHome.js";
import media from "./documentation/media.js";

const definition = {
  swagger: "2.0",
  info: {
    version: "2.0.0",
    title: "DragonRock API",
    description:
      "Backend DragonRock — API documentada alineada con rutas migradas (usuarios, noticias, emprende, en vivo, multimedia, servicios, tienda, dashboard).\n\n" +
      "Errores de validación (Zod): respuesta **400** con cuerpo JSON `{ \"error\": \"Validación\", \"issues\": ... }` en rutas con cuerpo/query/params validados.\n" +
      "Rutas públicas sensibles (login, registro, recuperación) pueden responder **429** por límite de peticiones (`express-rate-limit`).",
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  host: "localhost:3031",
  schemes: ["http"],

  tags: [
    {
      name: "Users",
      description: "Gestión de usuarios",
    },
    {
      name: "News",
      description: "Noticias por empresa",
    },
    {
      name: "Entrepreneurship",
      description: "Entrevistas Emprende por empresa",
    },
    {
      name: "LiveEvents",
      description: "Eventos en vivo por empresa",
    },
    {
      name: "Multimedia",
      description: "Videos, podcasts y galerías por empresa",
    },
    {
      name: "Services",
      description: "Servicios por empresa",
    },
    {
      name: "StoreCategories",
      description: "Categorías de la tienda por empresa",
    },
    {
      name: "StoreProducts",
      description: "Productos de la tienda por empresa",
    },
    {
      name: "Dashboard",
      description: "Panel administrativo — resumen y actividad reciente",
    },
    {
      name: "Public",
      description: "Endpoints públicos sin autenticación",
    },
    {
      name: "Media",
      description: "Subida y borrado de archivos en Cloudinary",
    },
  ],
  consumes: ["application/json"],
  produces: ["application/json"],
  paths: {
    "/user/login": user.login,
    "/user/logout": user.logout,
    "/user/logoutall": user.logoutAll,
    "/user": {
      ...user.list,
      ...user.create,
      ...user.update,
    },
    "/user/{id}": user.userByID,
    "/user/account": user.account,
    "/user/change_password": user.changePassword,
    "/user/add_company": user.addCompany,
    "/user/select_company": user.selectCompany,
    "/user/del_company": user.removeCompany,
    "/user/recovery/request": user.recoveryRequestPost,
    "/user/recovery/{email}": user.recoveryRequestCode,
    "/user/recovery": user.recoveryApplyCode,
    "/user/register": user.registerPublic,
    "/news": {
      get: news.listNews.get,
      post: news.createNews.post,
      patch: news.updateNews.patch,
    },
    "/news/paginate": news.paginateNews,
    "/news/public": news.publicListNews,
    "/news/public/{id}": news.publicNewsById,
    "/news/{id}": news.newsById,
    "/entrepreneurship": {
      post: entrepreneurship.createEntrepreneurship.post,
      patch: entrepreneurship.updateEntrepreneurship.patch,
    },
    "/entrepreneurship/paginate": entrepreneurship.paginateEntrepreneurship,
    "/entrepreneurship/public": entrepreneurship.publicListEntrepreneurship,
    "/entrepreneurship/public/{id}": entrepreneurship.publicEntrepreneurshipById,
    "/entrepreneurship/{id}": entrepreneurship.entrepreneurshipById,
    "/live-events": {
      post: liveEvents.createLiveEvent.post,
      patch: liveEvents.updateLiveEvent.patch,
    },
    "/live-events/paginate": liveEvents.paginateLiveEvents,
    "/live-events/public": liveEvents.publicListLiveEvents,
    "/live-events/public/{id}": liveEvents.publicLiveEventById,
    "/live-events/{id}": liveEvents.liveEventById,
    "/multimedia": {
      post: multimedia.createMultimedia.post,
      patch: multimedia.updateMultimedia.patch,
    },
    "/multimedia/paginate": multimedia.paginateMultimedia,
    "/multimedia/public": multimedia.publicListMultimedia,
    "/multimedia/public/{id}": multimedia.publicMultimediaById,
    "/multimedia/{id}": multimedia.multimediaById,
    "/services": {
      post: services.createService.post,
      patch: services.updateService.patch,
    },
    "/services/paginate": services.paginateServices,
    "/services/public": services.publicListServices,
    "/services/public/{id}": services.publicServiceById,
    "/services/{id}": services.serviceById,
    "/store/categories": {
      post: storeCategories.createStoreCategory.post,
      patch: storeCategories.updateStoreCategory.patch,
    },
    "/store/categories/simple": storeCategories.simpleListStoreCategories,
    "/store/categories/public": storeCategories.publicListStoreCategories,
    "/store/categories/paginate": storeCategories.paginateStoreCategories,
    "/store/categories/{id}": storeCategories.storeCategoryById,
    "/store/products": {
      post: storeProducts.createStoreProduct.post,
      patch: storeProducts.updateStoreProduct.patch,
    },
    "/store/products/paginate": storeProducts.paginateStoreProducts,
    "/store/products/public": storeProducts.publicListStoreProducts,
    "/store/products/public/slug/{slug}": storeProducts.publicStoreProductBySlug,
    "/store/products/public/{id}": storeProducts.publicStoreProductById,
    "/store/products/{id}": storeProducts.storeProductById,
    "/dashboard": dashboard.getDashboard,
    "/public/home": publicHome.getPublicHome,
    "/media/upload": media.uploadMedia,
    "/media/destroy": media.destroyMedia,
  },
  definitions: {
    ...user.definitions,
    ...news.definitions,
    ...entrepreneurship.definitions,
    ...liveEvents.definitions,
    ...multimedia.definitions,
    ...services.definitions,
    ...storeCategories.definitions,
    ...storeProducts.definitions,
    ...dashboard.definitions,
    ...publicHome.definitions,
    ...media.definitions,
  },
};

export default definition;
