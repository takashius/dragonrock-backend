# DragonRock Backend

API HTTP en **Node.js** + **Express** + **TypeScript** + **MongoDB** (Mongoose) para DragonRock. El código activo sigue una **arquitectura hexagonal / clean architecture**: la aplicación define casos de uso y puertos; la infraestructura implementa persistencia y servicios externos; la presentación adapta HTTP; la composición cablea todo sin lógica de negocio en los routers más allá del mapeo.

## Guía de arquitectura (detallada)

Documento único con **glosario**, **qué es y por qué usamos la arquitectura hexagonal**, **mapa de carpetas**, **patrones del repo** (puertos, casos de uso, outcomes, composición, Zod, auth, Swagger, tests) y **ejemplos citados del código**:

**[docs/GUIA_ARQUITECTURA.md](docs/GUIA_ARQUITECTURA.md)**

## Requisitos

- Node.js 20+ (recomendado; alineado con `@types/node` del proyecto)
- MongoDB accesible mediante `BD_URL`

## Scripts

| Comando        | Descripción                                      |
|----------------|--------------------------------------------------|
| `npm run dev`  | Desarrollo con recarga (`tsx watch index.ts`)   |
| `npm run build`| Compila TypeScript a `dist/`                    |
| `npm start`    | Ejecuta `node dist/index.js` (tras `build`)     |
| `npm run typecheck` | `tsc --noEmit` (validación de tipos)      |
| `npm run test`     | Pruebas unitarias (`node:test` + `tsx`)   |
| `npm run test:watch` | Mismo runner en modo observación      |

## Pruebas unitarias

Las pruebas viven en [`test/`](test/) y usan el runner integrado **`node:test`** con **`tsx`** (sin dependencia extra de Vitest/Jest). Cubren sobre todo la capa de **aplicación** (casos de uso con repositorios simulados), **infraestructura** ligera (`JwtAccessTokenVerifier`), **config** (`parseCommaSeparatedOrigins`) y **presentación** (mappers HTTP y middleware de auth).

Los repositorios Mongoose y la app Express completa no se levantan en estas pruebas; para eso conviene añadir más adelante pruebas de integración (p. ej. `supertest` + Mongo en memoria o contenedor).

## Variables de entorno

Plantilla sin secretos: **`.env.example`**. Cópiala a `.env` y ajusta valores (`cp .env.example .env` en Unix).

Cargadas con `dotenv` fuera de producción (`config.ts`). Las más importantes:

| Variable           | Uso |
|--------------------|-----|
| `BD_URL`           | URI de MongoDB (**obligatoria** en arranque) |
| `JWT_KEY`          | Secreto para firmar/verificar JWT (**obligatoria**) |
| `JWT_EXPIRES_IN`   | Caducidad del token (por defecto `365d`) |
| `COMPANY_DEFAULT`  | ID de empresa usada en plantillas de correo (registro, recuperación, etc.) |
| `USER_ADMIN`       | Usuario administrador (registro público de empresa) |
| `PORT` / `HOST`    | Servidor HTTP (por defecto `3031`, `http://localhost`) |
| `PUBLIC_ROUTE`     | Ruta estática pública |
| `MAILER_*`         | Configuración Mailjet / correo (`MAILER_HOST`, `MAILER_PORT`, `MAILER_USER`, `MAILER_PASS`, `MAILER_SECURE`) |
| `MONGO_DEBUG`      | Depuración Mongoose |
| `CORS_ORIGINS`     | Orígenes CORS permitidos (coma). **Obligatorio en producción** (lista no vacía). En desarrollo, vacío = CORS permisivo |
| `TRUST_PROXY`      | Proxies de confianza (`app.set('trust proxy', n)`). Tras balanceador/Ingress suele ser `1` |
| `SWAGGER_ENABLED`  | En `NODE_ENV=production`, `/api-docs` solo si es `true`. En desarrollo, por defecto activo salvo `false` |
| `JWT_EXPOSE_AUTH_ERRORS` | En producción, detalle de fallos JWT en la respuesta solo si es `true` (por defecto desactivado) |
| `MAILJET_REQUIRED` | Si es `true`, exige claves Mailjet y `MAIL_FROM_EMAIL` al arrancar (además de la regla en producción) |
| `MAIL_FROM_EMAIL` / `MAIL_FROM_NAME` | Remitente Mailjet (email verificado + nombre mostrado) |
| `RATE_LIMIT_*`     | Ventanas y máximos para `express-rate-limit` en login y rutas públicas sensibles (registro, recuperación) |

No commitees secretos: usa `.env` local (listado en `.gitignore`).

### Producción (hardening)

Antes de desplegar con `NODE_ENV=production`:

1. Define **`CORS_ORIGINS`** con los orígenes exactos del front (el arranque falla si queda vacío).
2. Configura **`MJ_APIKEY_PUBLIC`**, **`MJ_APIKEY_PRIVATE`** y **`MAIL_FROM_EMAIL`** (y opcionalmente `MAIL_FROM_NAME`). El arranque valida esto cuando Mailjet es obligatorio (producción o `MAILJET_REQUIRED=true`).
3. Tras un reverse proxy que inyecta `X-Forwarded-*`, ajusta **`TRUST_PROXY`** (habitualmente `1`) para que límites por IP y URLs correctas funcionen.
4. **`SWAGGER_ENABLED`**: deja la documentación interactiva desactivada en producción salvo que la necesites explícitamente (`true`).
5. La API usa **Helmet**, **CORS explícito**, **rate limiting** en `POST /user/login`, `POST /user/register`, solicitud de recuperación y confirmación de código.

**Recuperación de contraseña:** se recomienda **`POST /user/recovery/request`** con cuerpo `{ "email": "..." }`. La ruta histórica **`GET /user/recovery/:email`** expone el correo en la URL y en logs intermedios, lo que puede facilitar **enumeración de cuentas**; se mantiene por compatibilidad pero está deprecada en la documentación OpenAPI.

## Estructura de carpetas

```
├── index.ts                 # Arranque: DB, Express, Helmet, CORS, Swagger condicional, estáticos
├── config.ts                # Configuración centralizada desde env
├── db.ts                    # Conexión MongoDB
├── swagger.ts               # Definición Swagger 2.0
│
├── network/
│   └── routes.ts            # Entrada de rutas → delega en composition
│
├── composition/             # Composición (DI manual)
│   ├── registerRoutes.ts    # Montaje `/user` y `/news` en Express
│   └── wireHttpApi.ts       # Fábricas: repos, casos de uso, auth, routers
│
├── application/             # Casos de uso + puertos + tipos de resultado
│   ├── ports/               # Interfaces (repositorios, mail, JWT, empresa…)
│   ├── types/               # Outcomes HTTP-compatibles, AuthUserPayload, etc.
│   ├── news/
│   └── user/
│
├── infrastructure/          # Adaptadores (detalles técnicos)
│   ├── persistence/
│   │   ├── mongoose/        # Esquemas y modelos Mongoose (User, Company, News)
│   │   ├── mongooseUserRepository.ts
│   │   └── mongooseNewsRepository.ts
│   ├── auth/
│   ├── email/
│   └── company/
│
├── presentation/http/       # Routers Express, auth factory, mappers HTTP
│
├── middelware/              # Utilidades transversales (mailer Mailjet, errores)
├── documentation/         # Fragmentos Swagger por módulo
├── types/                   # Ampliación Express (`req.user`, etc.)
├── domain/                  # Reservado para reglas de dominio puras (vacío)
├── legacy/                  # Opcional: código no cableado en la API (ver legacy/README.md)
└── test/                    # Pruebas unitarias (*.test.ts)
```

Los **modelos Mongoose** del producto activo viven en `infrastructure/persistence/mongoose/` (`userModel.ts`, `companyModel.ts`, `newsModel.ts`): son detalle de persistencia, no “componentes” genéricos. Para una descripción amplia de cada carpeta y términos, ver **[docs/GUIA_ARQUITECTURA.md](docs/GUIA_ARQUITECTURA.md)**.

## Arquitectura

Resumen ejecutivo; la guía extendida con diagramas mentales, glosario y ejemplos está en **[docs/GUIA_ARQUITECTURA.md](docs/GUIA_ARQUITECTURA.md)**.

### Regla de dependencias

1. **`application`** solo depende de **puertos** (`application/ports`) y **tipos** propios. No importa Express ni Mongoose ni implementaciones concretas.
2. **`infrastructure`** implementa esos puertos (Mongoose, JWT, Mailjet, etc.).
3. **`presentation/http`** traduce HTTP ↔ casos de uso; depende de `application` y de Express.
4. **`composition`** es donde se instancian adaptadores y casos de uso y se inyectan en los routers.

Flujo típico: **Request** → **Router (presentation)** → **Caso de uso (application)** → **Puerto** → **Implementación (infrastructure)** → respuesta mapeada (`NewsOutcome`, `UserOutcome`, etc.).

### Módulos HTTP montados

| Prefijo   | Contenido |
|-----------|-----------|
| `/user`   | CRUD usuario, login, logout, empresas asociadas, recuperación de contraseña, registro público |
| `/news`   | CRUD de noticias por empresa del usuario autenticado |

La autenticación usa **JWT** en `Authorization: Bearer <token>`. El middleware rellena `req.user` (`AuthUserPayload`).

### Documentación OpenAPI

- **`/api-docs`**: Swagger UI (solo si `swaggerEnabled` en configuración; en producción típicamente desactivado).
- Definición en `swagger.ts` + `documentation/user.ts` y `documentation/news.ts`.

## Principios de diseño (resumen)

- **SOLID**: casos de uso acotados; puertos para persistencia y correo; composición con **DIP**.
- **Clean / hexagonal**: el centro estable es `application`; frameworks y BD son reemplazables vía adaptadores.

## Desarrollo

1. Clonar el repositorio y `npm install`.
2. Copiar y ajustar `.env` (mínimo `BD_URL`, `JWT_KEY`; recomendado `COMPANY_DEFAULT`, Mailjet si usas correos).
3. `npm run dev` y abrir `http://localhost:3031` (o el `PORT` configurado).
4. Antes de commit o PR: `npm run typecheck` y `npm run build`.

## Licencia

ISC (ver `package.json`).
