# Guía de arquitectura y estructura — DragonRock Backend

Este documento describe la **organización del repositorio**, la **arquitectura hexagonal / clean** que seguimos, el **significado de los términos** y los **patrones concretos** del proyecto, con referencias al código real.

---

## 1. Glosario de términos

| Término | Significado en este proyecto |
|--------|------------------------------|
| **Dominio** | Reglas y conceptos del negocio (usuario, empresa, noticia). El código “puro” de dominio puede vivir en `domain/` (hoy reservado, casi vacío); gran parte del comportamiento está en **casos de uso** en `application/`. |
| **Caso de uso (use case)** | Una clase que representa **una acción** que puede hacer el sistema ante el exterior (ej. “iniciar sesión”, “listar noticias”). Orquesta puertos; no conoce HTTP ni Mongoose. Vive en `application/<contexto>/`. |
| **Puerto** | **Interfaz** (contrato TypeScript) que define qué necesita el caso de uso del mundo exterior (persistencia, correo, JWT…). Está en `application/ports/`. |
| **Adaptador** | **Implementación** de un puerto con tecnología concreta (Mongoose, Mailjet, `jsonwebtoken`…). Vive en `infrastructure/`. |
| **Adaptador de entrada (driving)** | En nuestro caso, principalmente **HTTP**: Express recibe la petición y la traduce a llamadas al caso de uso. Carpeta `presentation/http/`. |
| **Adaptador de salida (driven)** | Persistencia, APIs externas, sistema de archivos. Ej.: `MongooseUserRepository`. |
| **Composición (composition root)** | El lugar donde se **ensamblan** implementaciones y casos de uso y se inyectan en los routers. Aquí: `composition/wireUserHttpStack.ts`, `composition/wireNewsRouter.ts` (y `wireHttpApi.ts` como reexportación), más `registerRoutes.ts`. |
| **Outcome** | Objeto de resultado (`UserOutcome`, `NewsOutcome`, …) con `status` HTTP-like y `message` (y a veces `detail`) que el **mapper de presentación** convierte en respuesta Express. |
| **Mapper HTTP** | Funciones que traducen un `*Outcome` a `res.status().send()` (o JSON de error). Ej.: `sendNewsOutcome`, `sendUserOutcomeWithDetail`. |
| **DTO / cuerpo de petición** | Datos que llegan por HTTP; los validamos con **Zod** (`presentation/http/schemas/routeSchemas.ts`) antes de pasarlos al caso de uso. |
| **Middleware** | Funciones Express encadenadas (auth, validación, rate limit). El auth se construye con `createAuthMiddleware`. |
| **Hexagonal / Ports and Adapters** | Sinónimo del enfoque anterior: **núcleo** (aplicación) estable; **bordes** intercambiables (HTTP, BD, correo). |

---

## 2. ¿Qué es la arquitectura hexagonal?

La **arquitectura hexagonal** (Alistair Cockburn), también llamada **ports and adapters**, organiza el software en:

1. **Núcleo (dominio + aplicación)** — reglas y orquestación **independientes** de frameworks.
2. **Puertos** — interfaces que el núcleo define hacia afuera (“necesito guardar un usuario”, “necesito enviar un correo”).
3. **Adaptadores** — piezas que **cumplen** esos contratos usando MongoDB, Express, Mailjet, etc.

El dibujo clásico es un **hexágono** (el núcleo) con **entradas** (usuarios, APIs, colas) y **salidas** (BD, correo, terceros) conectados por puertos.

```
        [ HTTP / Express ] -----> |  Casos de uso   | -----> | Puerto: UserRepository |
              ^                  |   (application)  |        +----------|-------------+
              |                  +------------------+                   v
         presentation                                            [ MongooseUserRepository ]
```

La idea no es dibujar seis lados literalmente, sino **invertir dependencias**: el núcleo **no importa** Mongo ni Express; son los adaptadores los que dependen del núcleo (interfaces).

---

## 3. ¿Por qué la usamos en DragonRock?

- **Cambiar tecnología sin reescribir el negocio**: mañana otra BD u otro framework HTTP solo toca adaptadores y composición, no cada caso de uso.
- **Tests más baratos**: los casos de uso se prueban con **dobles** de los puertos, sin levantar Mongo ni Express (ver `test/`).
- **Límites claros**: evita que la lógica de negocio se mezcle con `req`/`res` o con esquemas Mongoose en todas partes.
- **Onboarding**: cualquier desarrollador sabe dónde añadir una feature (puerto → caso de uso → repo → router → wire).

---

## 4. Cómo se aplica en este repositorio (capas → carpetas)

| Capa | Carpeta | Rol |
|------|---------|-----|
| **Aplicación** | `application/` | Casos de uso + `ports/` + `types/`. Sin Express/Mongoose. |
| **Infraestructura** | `infrastructure/` | Implementaciones: `mongoose*Repository`, JWT, Mailjet, lookups. Modelos en `persistence/mongoose/`. |
| **Presentación** | `presentation/http/` | Routers, validación Zod, mappers, auth factory, rate limiters. |
| **Composición** | `composition/` | `registerRoutes.ts` + un **`wire*.ts` por módulo** (p. ej. `wireUserHttpStack.ts`, `wireNewsRouter.ts`); `wireHttpApi.ts` reexporta para imports estables. |
| **Entrada HTTP mínima** | `network/routes.ts` | Solo delega en `registerRoutes`. |
| **Arranque** | `index.ts`, `config.ts`, `db.ts` | Servidor, seguridad transversal, conexión BD. |
| **Contrato API** | `swagger.ts`, `documentation/` | OpenAPI 2.0 para Swagger UI. |
| **Tipos globales** | `types/` | P. ej. ampliación de `Express.Request` (`req.user`, `validatedQuery`). |
| **Utilidades legacy de nombre** | `middelware/` | Mailer, etc. (nombre histórico con typo; no renombrar sin migrar imports). |
| **Dominio puro (futuro)** | `domain/` | Reservado. |
| **Código no cableado** | `legacy/` | Ver `legacy/README.md`. |
| **Pruebas** | `test/` | `node:test` + `tsx`. |

---

## 5. Flujo de una petición HTTP (resumen)

1. **Express** recibe la petición en un router de `presentation/http/*Router.ts`.
2. Opcional: **rate limit**, **Zod** (`validateBody` / `validateParams` / `validateQuery`), **auth** (`auth()`).
3. El handler llama a **`deps.algoUseCase.execute(...)`** con datos ya validados.
4. El caso de uso usa **puertos** (interfaces); en runtime la implementación es la de **infrastructure** (inyectada en el `wire*` del módulo correspondiente).
5. El caso de uso devuelve un **`Outcome`**.
6. El **mapper** traduce el outcome a `res.status(...).send(...)`.

---

## 6. Patrones que usamos (con ejemplos del código)

### 6.1. Puerto (interfaz) en `application/ports/`

El caso de uso solo conoce esta interfaz, no Mongoose:

```7:32:application/ports/userRepository.ts
export interface UserRepository {
  findActiveUserWithToken(
    userId: string,
    token: string
  ): Promise<unknown | null>;

  getUser(userId: string | null): Promise<UserOutcome>;
  getUsers(companyId: string | null): Promise<UserOutcome>;
  addUser(user: Record<string, unknown>): Promise<UserOutcome>;
  registerUserPublic(request: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    docId: string;
  }): Promise<UserOutcome>;
  updateUser(user: {
    id: string;
    name?: string;
    lastname?: string;
    photo?: string;
    phone?: string;
    password?: string;
  }): Promise<UserOutcome>;
  deleteUser(id: string): Promise<UserOutcome>;
  loginUser(mail: string, pass: string): Promise<UserOutcome>;
  // ...
}
```

**Cómo lo usamos:** cada nuevo método que el dominio necesite de persistencia se añade al puerto y luego se implementa en `MongooseUserRepository` (u otro adaptador).

---

### 6.2. Caso de uso + inyección por constructor

Un caso de uso recibe el puerto en el constructor y expone `execute`:

```1:23:application/user/loginUserUseCase.ts
import type { UserRepository } from "../ports/userRepository.js";
import type { UserOutcome } from "../types/userOutcome.js";

export class LoginUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(credentials: {
    email: string;
    password: string;
  }): Promise<UserOutcome> {
    try {
      const { email, password } = credentials;
      return await this.users.loginUser(email, password);
    } catch (e: unknown) {
      console.log(e);
      return {
        status: 500,
        message: "Unexpected controller error",
        detail: e,
      };
    }
  }
}
```

**Cómo lo usamos:** un archivo por caso de uso; dependencias `private readonly`; retorno `Promise<UserOutcome>` (o el outcome del agregado que toque).

---

### 6.3. Tipo Outcome

Contrato de salida genérico hacia la capa HTTP:

```1:6:application/types/userOutcome.ts
/** Resultado estándar de casos de usuario (compatible con respuestas HTTP actuales). */
export type UserOutcome = {
  status: number;
  message: unknown;
  detail?: unknown;
};
```

**Cómo lo usamos:** el router hace `switch (outcome.status)` o delega en un mapper que interpreta `status`, `message` y opcionalmente `detail`.

---

### 6.4. Composición: cablear adaptadores y casos de uso

En `composition/wireUserHttpStack.ts` se instancian repositorios reales, casos de uso y el router con un objeto `deps`:

```55:66:composition/wireUserHttpStack.ts
  const userRouter = createUserRouter({
    auth,
    listUsers: new ListUsersUseCase(userRepository),
    getUser: new GetUserUseCase(userRepository),
    addUser: new AddUserUseCase(userRepository),
    deleteUser: new DeleteUserUseCase(userRepository),
    updateUser: new UpdateUserUseCase(userRepository),
    loginUser: new LoginUserUseCase(userRepository),
    logoutUser: new LogoutUserUseCase(userRepository),
    logoutAll: new LogoutAllUseCase(userRepository),
    changePassword: new ChangePasswordUseCase(userRepository),
    addCompany: new AddCompanyUseCase(userRepository),
    removeCompany: new RemoveCompanyUseCase(userRepository),
    selectCompany: new SelectCompanyUseCase(userRepository),
```

**Cómo lo usamos:** cualquier nuevo caso de uso se **construye aquí** y se pasa al `create*Router`. No se usa contenedor IoC externo; es **DI manual** explícita.

Montaje de rutas en Express:

```11:15:composition/registerRoutes.ts
export function registerRoutes(app: Express): void {
  const { auth, userRouter } = wireUserHttpStack();
  app.use(`${API_PREFIX}/user`, userRouter);
  app.use(`${API_PREFIX}/news`, wireNewsRouter(auth));
}
```

---

### 6.5. Presentación: validación con Zod y middleware

Validamos el cuerpo antes del handler; en error respondemos JSON estructurado:

```11:21:presentation/http/validateRequest.ts
/** Sustituye `req.body` por el resultado parseado (tipos en handlers vía `z.infer` del esquema usado). */
export function validateBody<S extends ZodTypeAny>(schema: S): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error);
      return;
    }
    req.body = parsed.data;
    next();
  };
}
```

Los esquemas viven en `presentation/http/schemas/routeSchemas.ts`. En el router se encadenan: `validateBody(loginBodySchema)`, `loginRateLimiter`, handler.

---

### 6.6. Autenticación como adaptador de entrada

El middleware llama al caso de uso `AuthenticateUserUseCase` y rellena `req.user` / `req.token`:

```9:28:presentation/http/authMiddlewareFactory.ts
export function createAuthMiddleware(
  authenticateUser: AuthenticateUserUseCase
) {
  return function auth() {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const rawAuth = req.header("Authorization") || "";
        const token = rawAuth.replace(/^Bearer\s+/i, "").trim();
        const result = await authenticateUser.execute(token);
        if (!result.ok) {
          res.status(401).send({ error: result.errorMessage });
          return;
        }
        req.user = result.user;
        req.token = result.token;
        next();
```

**Cómo lo usamos:** `router.get("/ruta", auth(), handler)` para rutas protegidas.

---

### 6.7. Adaptador de salida (repositorio Mongoose)

Implementa `UserRepository` en `infrastructure/persistence/mongooseUserRepository.ts`, usando modelos de `infrastructure/persistence/mongoose/`. No importa Express.

**Cómo lo usamos:** al añadir un método al puerto, la implementación Mongoose debe respetar la misma firma y devolver los mismos `Outcome`.

---

### 6.8. Configuración y seguridad de arranque

- **`config.ts`**: lee `process.env`, expone `AppConfig`, `buildCorsOptions()`, `assertSecurityConfigAtStartup()`.
- **`index.ts`**: llama a `assertSecurityConfigAtStartup()`, Helmet, CORS, Swagger condicional, `trust proxy` según config.

Las variables nuevas deben documentarse en **`.env.example`** y, si afectan operación, en **`README.md`**.

---

### 6.9. OpenAPI (Swagger)

- **`swagger.ts`**: ensambla `paths` y `definitions`.
- **`documentation/user.ts`** y **`documentation/news.ts`**: fragmentos por módulo.

Cualquier ruta nueva debe reflejarse aquí para que `/api-docs` (cuando esté habilitado) coincida con la API real.

---

### 6.10. Pruebas unitarias

- Ubicación: `test/**/*.test.ts`.
- Estilo: **`node:test`** (`import test from "node:test"`) ejecutado con **`tsx`**.
- Casos de uso: pasar un **objeto mock** que implemente el puerto mínimo necesario.

---

## 7. Checklist: añadir un módulo o feature HTTP

1. ¿Necesitas persistencia o servicio nuevo? → interfaz en `application/ports/`.
2. Caso(s) de uso en `application/<contexto>/` con `execute` y tipos en `application/types/` si hace falta.
3. Implementación en `infrastructure/` (y modelos en `mongoose/` si aplica).
4. Router en `presentation/http/` + esquemas Zod + mapper si el patrón de respuesta es nuevo.
5. Nuevo archivo `composition/wireTuModulo.ts` + reexport en `wireHttpApi.ts` (opcional) + `registerRoutes.ts`.
6. `documentation/*.ts` + `swagger.ts`.
7. Pruebas en `test/`.
8. `npm run typecheck` y `npm run test`.

---

## 8. Referencias rápidas en el repo

| Tema | Dónde mirar |
|------|-------------|
| Ejemplo caso de uso simple | `application/user/loginUserUseCase.ts` |
| Ejemplo router con validación y límites | `presentation/http/userRouter.ts` |
| Esquemas Zod HTTP | `presentation/http/schemas/routeSchemas.ts` |
| Composición usuario + noticias | `composition/wireUserHttpStack.ts`, `composition/wireNewsRouter.ts` |
| Mapeo respuestas noticias | `presentation/http/newsHttpMapper.ts` |
| Reglas para el agente / IDE | `.cursor/rules/*.mdc` |

---

*Documento alineado con el estado del repositorio DragonRock Backend. Si la estructura cambia, actualiza esta guía en el mismo PR.*
