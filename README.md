# DragonRock Backend

API HTTP en **Node.js** + **Express** + **TypeScript** + **MongoDB** (Mongoose) para DragonRock. El código activo de negocio HTTP sigue una **arquitectura hexagonal / clean architecture** por capas: la aplicación define casos de uso y puertos; la infraestructura implementa persistencia y servicios externos; la presentación adapta HTTP; la composición cablea todo sin lógica de dominio.

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

No commitees secretos: usa `.env` local (listado en `.gitignore`).

## Estructura de carpetas

```
├── index.ts                 # Arranque: DB, Express, CORS, Swagger, estáticos
├── config.ts                # Configuración centralizada desde env
├── db.ts                    # Conexión MongoDB
├── swagger.ts               # Definición Swagger 2.0
│
├── network/
│   └── routes.ts            # Entrada de rutas → delega en composition
│
├── composition/             # Raíz de composición (DI manual)
│   ├── registerRoutes.ts    # Montaje `/user` y `/news` en Express
│   └── wireHttpApi.ts       # Fábricas: repos, casos de uso, auth, routers
│
├── application/             # Casos de uso + puertos + DTOs de resultado
│   ├── ports/               # Interfaces (repositorios, mail, JWT, empresa…)
│   ├── types/               # Outcomes HTTP-compatibles, AuthUserPayload, etc.
│   ├── news/                # Casos de uso de noticias
│   └── user/                # Casos de uso de usuario y autenticación
│
├── infrastructure/          # Adaptadores: Mongoose, Mailjet, JWT…
│   ├── persistence/
│   ├── auth/
│   ├── email/
│   └── company/
│
├── presentation/http/     # Routers Express, middleware de auth, mappers HTTP
│
├── components/              # Modelos Mongoose legacy (User, Company, News…)
├── middelware/              # Utilidades transversales (mailer, errores de validación)
├── documentation/           # Fragmentos Swagger por módulo
├── types/                   # Ampliación de tipos Express (`req.user`, etc.)
└── domain/                  # Reservado para entidades de dominio puras (vacío por ahora)
```

## Arquitectura

### Regla de dependencias

1. **`application`** solo depende de **puertos** (`application/ports`) y **tipos** propios. No importa Express ni Mongoose ni implementaciones concretas.
2. **`infrastructure`** implementa esos puertos y puede usar Mongoose, `jsonwebtoken`, modelos en `components/`, etc.
3. **`presentation/http`** traduce HTTP ↔ casos de uso; depende de `application` y de Express.
4. **`composition`** es el único sitio donde se instancian implementaciones concretas y se inyectan en routers y casos de uso.

Flujo típico: **Request** → **Router (presentation)** → **Caso de uso (application)** → **Puerto** → **Implementación (infrastructure)** → respuesta mapeada al status/cuerpo HTTP histórico del proyecto (`NewsOutcome`, `UserOutcome`, etc.).

### Módulos HTTP montados

| Prefijo   | Contenido |
|-----------|-----------|
| `/user`   | CRUD usuario, login, logout, empresas asociadas, recuperación de contraseña, registro público |
| `/news`   | CRUD de noticias por empresa del usuario autenticado |

La autenticación usa **JWT** en cabecera `Authorization: Bearer <token>`. El middleware construye `req.user` (`AuthUserPayload`: `_id`, datos básicos y `company` seleccionada).

### Documentación OpenAPI

- **`/api-docs`**: interfaz Swagger UI.
- Definición ensamblada en `swagger.ts` a partir de `documentation/user.ts` y `documentation/news.ts`.

### Código legacy no montado

Bajo `components/` existen módulos **`.js`** (p. ej. customers, products, cotiza, moneyFlow) que **no** se registran en `composition/registerRoutes.ts`. No forman parte del API activo documentado aquí hasta que se migren y se monten rutas.

## Principios de diseño (resumen)

- **SOLID**: casos de uso pequeños donde aplica; puertos para abstraer persistencia y correo; la composición respeta **DIP** (dependencias hacia abstracciones).
- **Clean / hexagonal**: el núcleo es la aplicación; los detalles (BD, mail, Express) son adaptadores.
- **Coexistencia con legacy**: modelos Mongoose permanecen en `components/*/model` como capa de persistencia compartida hasta una eventual extracción a `domain/` + mappers.

## Desarrollo

1. Clonar el repositorio y `npm install`.
2. Copiar y ajustar `.env` (mínimo `BD_URL`, `JWT_KEY`; recomendado `COMPANY_DEFAULT`, mailer si usas correos).
3. `npm run dev` y abrir `http://localhost:3031` (o el `PORT` configurado).
4. Antes de commit o PR: `npm run typecheck` y `npm run build`.

## Licencia

ISC (ver `package.json`).
