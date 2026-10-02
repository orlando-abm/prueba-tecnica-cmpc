# CMPC Libros

Sistema de gestión de inventario de libros para la tienda CMPC. Permite administrar el catálogo completo (libros, autores, editoriales, géneros) con autenticación por roles, auditoría de cambios y exportación de datos.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS v4, TanStack Query, Zustand |
| Backend | NestJS 12, TypeScript, Prisma 5, PostgreSQL 16 |
| Almacenamiento | MinIO (S3-compatible) |
| Monorepo | Turborepo + pnpm workspaces |
| Infraestructura | Docker Compose |

---

## Requisitos previos

- [Node.js](https://nodejs.org/) >= 24
- [pnpm](https://pnpm.io/) >= 11 — `npm install -g pnpm`
- [Docker](https://www.docker.com/) + Docker Compose

---

## Levantamiento rápido (Docker)

Levanta toda la aplicación (BD, MinIO, API, web) con un solo comando:

```bash
docker compose up --build
```

| Servicio | URL |
|----------|-----|
| Web | http://localhost:5173 |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/docs |
| MinIO Console | http://localhost:9001 |

> Las migraciones corren automáticamente al iniciar la API.

---

## Levantamiento en desarrollo

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Levantar infraestructura (BD + MinIO)

```bash
docker compose up postgres minio -d
```

### 3. Configurar variables de entorno

```bash
# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env
```

### 4. Correr migraciones

```bash
pnpm db:migrate
```

### 5. Poblar la base de datos

```bash
pnpm db:seed
```

### 6. Levantar en modo desarrollo

```bash
pnpm dev
```

| Servicio | URL |
|----------|-----|
| Web | http://localhost:5173 |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/docs |

---

## Variables de entorno

### `apps/api/.env`

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto de la API | `3000` |
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://cmpc:cmpc@localhost:5432/cmpc_libros` |
| `JWT_SECRET` | Secreto para firmar tokens JWT (mínimo 32 caracteres) | `dev-secret-must-be-at-least-32-chars!!` |
| `JWT_EXPIRES_IN` | Expiración del token JWT | `7d` |
| `MINIO_ENDPOINT` | Host de MinIO | `localhost` |
| `MINIO_PORT` | Puerto de MinIO | `9000` |
| `MINIO_ACCESS_KEY` | Access key de MinIO | `cmpc` |
| `MINIO_SECRET_KEY` | Secret key de MinIO | `cmpc1234` |
| `MINIO_BUCKET` | Nombre del bucket | `cmpc-libros` |
| `MINIO_USE_SSL` | Usar SSL para MinIO | `false` |
| `MINIO_PUBLIC_URL` | URL pública para acceder a archivos | `http://localhost:9000` |
| `CORS_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |
| `SEED_SUPER_ADMIN_EMAIL` | Email del super administrador | `admin@cmpc.cl` |
| `SEED_SUPER_ADMIN_PASSWORD` | Contraseña del super administrador | `Admin1234!` |
| `SEED_ADMIN_EMAIL` | Email del administrador | `editor@cmpc.cl` |
| `SEED_ADMIN_PASSWORD` | Contraseña del administrador | `Editor1234!` |
| `SEED_USER_EMAIL` | Email del usuario lector | `lector@cmpc.cl` |
| `SEED_USER_PASSWORD` | Contraseña del usuario lector | `Lector1234!` |

### `apps/web/.env`

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API | `http://localhost:3000` |

---

## Credenciales de acceso (seed)

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Super Admin | `admin@cmpc.cl` | `Admin1234!` |
| Admin | `editor@cmpc.cl` | `Editor1234!` |
| Usuario | `lector@cmpc.cl` | `Lector1234!` |

---

## Scripts

Todos los comandos se ejecutan desde la raíz del monorepo.

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Levanta API y web en modo desarrollo con hot reload |
| `pnpm build` | Build de producción de todos los paquetes |
| `pnpm test` | Corre los tests de todos los paquetes |
| `pnpm db:migrate` | Aplica las migraciones pendientes |
| `pnpm db:seed` | Pobla la BD con datos iniciales |
| `pnpm db:studio` | Abre Prisma Studio en el navegador |

Scripts adicionales dentro de `apps/api`:

| Comando | Descripción |
|---------|-------------|
| `pnpm db:migrate:dev` | Crea una nueva migración en desarrollo |
| `pnpm db:reset` | Resetea la BD y re-aplica todas las migraciones |
| `pnpm test:cov` | Tests con reporte de cobertura |
| `pnpm test:e2e` | Tests end-to-end |

Scripts dentro de `apps/web`:

| Comando | Descripción |
|---------|-------------|
| `pnpm --filter web storybook` | Levanta Storybook en http://localhost:6006 |
| `pnpm --filter web build-storybook` | Genera build estático de Storybook |

---

## Testing

### Ejecutar todos los tests

```bash
# Todos los paquetes (backend + frontend)
pnpm test

# Solo backend
pnpm --filter api test

# Solo frontend
pnpm --filter web test
```

### Ejecutar con cobertura

```bash
# Backend
pnpm --filter api test:cov

# Frontend
pnpm --filter web test:cov
```

### Cobertura actual

| App | Statements | Branches | Functions | Lines |
|-----|-----------|----------|-----------|-------|
| Backend (API) | 92% | 80% | 86% | 92% |

### Qué se prueba

**Backend — tests unitarios de servicios** (lógica de negocio, sin base de datos):

| Archivo | Casos cubiertos |
|---------|----------------|
| `books.service.spec.ts` | CRUD, soft delete, restore, exportación CSV, validación de relaciones, conflictos ISBN/SKU |
| `genres.service.spec.ts` | CRUD, soft delete, restore, duplicados activos y eliminados |
| `authors.service.spec.ts` | CRUD, soft delete, restore, duplicados activos y eliminados |
| `publishers.service.spec.ts` | CRUD, soft delete, restore, duplicados activos y eliminados |
| `auth.service.spec.ts` | Register (email duplicado), login (usuario inexistente, contraseña incorrecta, éxito) |
| `audit.service.spec.ts` | Log sin userId, log con userId, paginación |

**Backend — tests unitarios de controladores** (delegación al servicio):

| Archivo | Casos cubiertos |
|---------|----------------|
| `books.controller.spec.ts` | Todos los endpoints, filtrado de includes permitidos |
| `auth.controller.spec.ts` | Register y login |

**Frontend — tests unitarios de servicios y hooks**:

| Archivo | Casos cubiertos |
|---------|----------------|
| `http.spec.ts` | `ApiError`, headers de autorización, manejo de 204, errores de API |
| `auth.service.spec.ts` | Login con credenciales correctas e incorrectas |
| `books.service.spec.ts` | Todos los métodos: findAll, findBySlug, create, update, remove, restore, exportCsv |
| `useDebounce.spec.ts` | Delay, cancelación de timer, delay personalizado |

**Frontend — tests de componentes** (render real con jsdom):

| Archivo | Casos cubiertos |
|---------|----------------|
| `LoginPage.spec.tsx` | Render del formulario, validación Zod, error de credenciales, estado cargando |
| `BookCard.spec.tsx` | Badges por estado (Disponible / Sin stock / Eliminado), botones, stopPropagation |

### Stack de testing

| Herramienta | Uso |
|-------------|-----|
| [Vitest](https://vitest.dev/) | Test runner en ambas apps |
| [@nestjs/testing](https://docs.nestjs.com/fundamentals/testing) | Módulos de prueba para NestJS |
| [@testing-library/react](https://testing-library.com/react) | Render de componentes React |
| [@testing-library/user-event](https://testing-library.com/) | Simulación de interacciones del usuario |
| [jsdom](https://github.com/jsdom/jsdom) | DOM simulado para tests de frontend |

---

## Documentación API

La API está documentada con Swagger/OpenAPI y disponible en:

```
http://localhost:3000/docs
```

Para autenticarse en Swagger: ejecutar `POST /auth/login`, copiar el `token` de la respuesta y pegarlo en el botón **Authorize** (esquema Bearer).

---

## Storybook

Catálogo visual de componentes UI. Permite explorar e interactuar con cada componente de forma aislada, sin necesidad de levantar la aplicación completa.

```bash
pnpm --filter web storybook
# http://localhost:6006
```

### Componentes documentados

| Categoría | Componente | Stories |
|-----------|-----------|---------|
| Atoms | Button | Primary, Secondary, Ghost, Destructive, Success, Disabled, WithIcon, AllVariants |
| Atoms | Badge | Disponible, SinStock, Género, Info, Eliminado, AllVariants |
| Atoms | Input | Default, WithError, WithStartIcon, WithEndIcon, Disabled |
| Atoms | Checkbox | Unchecked, Checked, SinLabel, Interactivo |
| Atoms | Select | Default, ConValor, ConError, Disabled, Interactivo |
| Atoms | Modal | Abierto, Cerrado, Interactivo |
| Atoms | Toast | Interactivo (dispara toasts reales) |
| Organisms | Table | Default, ConOrdenamiento, Vacía, SinClickFila |
| Organisms | Pagination | Default, PaginaMitad, UltimaPagina, PocasPaginas, Interactivo |
| Books | BookCard | Disponible, SinStock, Eliminado, ConImagen, TituloLargo |

---

## Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        Cliente                              │
│                  React + TanStack Query                     │
│                   http://localhost:5173                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      NestJS API                             │
│               http://localhost:3000                         │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Auth    │  │  Books   │  │ Authors  │  │ Audit     │  │
│  │  Module  │  │  Module  │  │ Genres   │  │ Module    │  │
│  └──────────┘  └──────────┘  │Publishers│  └───────────┘  │
│                               └──────────┘                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Global: ResponseInterceptor · HttpExceptionFilter  │   │
│  │          ZodValidationPipe · UserContextInterceptor │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────┬────────────────────────────┬─────────────────────┘
           │                            │
           ▼                            ▼
┌─────────────────────┐    ┌────────────────────────┐
│    PostgreSQL 16     │    │      MinIO (S3)         │
│    (Prisma ORM)      │    │  Almacenamiento         │
│  localhost:5432      │    │  imágenes de portadas   │
└─────────────────────┘    │  localhost:9000         │
                            └────────────────────────┘
```

---

## Modelo relacional

```mermaid
erDiagram
    User {
        uuid id PK
        string email
        string password
        enum role
        datetime created_at
        datetime updated_at
    }
    UserProfile {
        uuid id PK
        string name
        string lastname
        string phone
        string avatar_url
        uuid user_id FK
    }
    Genre {
        uuid id PK
        string name
        string slug
        datetime deleted_at
    }
    Author {
        uuid id PK
        string name
        string slug
        datetime deleted_at
    }
    Publisher {
        uuid id PK
        string name
        string slug
        datetime deleted_at
    }
    Book {
        uuid id PK
        string title
        string slug
        string isbn
        string sku
        decimal price
        int stock
        string image_url
        datetime deleted_at
        uuid genre_id FK
        uuid author_id FK
        uuid publisher_id FK
    }
    AuditLog {
        uuid id PK
        enum action
        string entity
        string entity_id
        json metadata
        datetime created_at
        uuid user_id FK
    }

    User ||--o| UserProfile : "tiene"
    User ||--o{ AuditLog : "genera"
    Genre ||--o{ Book : "clasifica"
    Author ||--o{ Book : "escribe"
    Publisher ||--o{ Book : "publica"
```

---

## Estructura del proyecto

```
prueba-cmpc/
├── apps/
│   ├── api/                        # Backend NestJS
│   │   ├── prisma/
│   │   │   ├── migrations/         # Migraciones de Prisma
│   │   │   ├── schema.prisma       # Modelo de datos
│   │   │   └── seed.ts             # Script de seed
│   │   └── src/
│   │       ├── common/
│   │       │   ├── decorators/     # @CurrentUser
│   │       │   ├── filters/        # HttpExceptionFilter, ZodExceptionFilter
│   │       │   ├── interceptors/   # ResponseInterceptor, UserContextInterceptor
│   │       │   ├── middlewares/    # CorrelationIdMiddleware
│   │       │   └── utils/          # slugify
│   │       ├── config/             # CORS, env, logger, Swagger
│   │       ├── database/           # PrismaService + DatabaseModule
│   │       └── modules/
│   │           ├── auth/           # JWT login/register + guards + strategies
│   │           ├── books/          # CRUD libros + exportación CSV
│   │           ├── authors/        # CRUD autores
│   │           ├── genres/         # CRUD géneros
│   │           ├── publishers/     # CRUD editoriales
│   │           ├── users/          # Perfil + cambio de contraseña
│   │           ├── storage/        # Upload de imágenes a MinIO
│   │           └── audit/          # Consulta de logs de auditoría
│   │
│   └── web/                        # Frontend React
│       └── src/
│           ├── hooks/              # TanStack Query (useBooks, useAuthors, …)
│           ├── lib/                # http.ts (fetch wrapper), query.ts (QueryClient)
│           ├── pages/              # Una carpeta por módulo (books, authors, …)
│           ├── services/           # Llamadas a la API (books.service.ts, …)
│           ├── store/              # Zustand (auth, book selection, toasts)
│           └── ui/
│               ├── atoms/          # Button, Input, Modal, Select, Toast, …
│               ├── organisms/      # Table, Pagination, Sidebar
│               ├── layouts/        # AppLayout
│               └── tokens/         # CSS variables de colores y tipografía
│
└── packages/
    └── shared/                     # Código compartido entre api y web
        ├── schemas/                # Zod schemas (validación + DTOs)
        ├── types/                  # Tipos TypeScript inferidos
        └── constants/              # Endpoints de la API
```

---

## Decisiones de arquitectura

### Monorepo con Turborepo
Se optó por un monorepo (`apps/api`, `apps/web`, `packages/shared`) para compartir tipos y schemas Zod entre frontend y backend sin duplicación. Turborepo gestiona el build cache y la ejecución paralela de tareas.

### Autenticación JWT stateless
Se implementó JWT con expiración de 7 días. Un sistema de refresh tokens requeriría almacenamiento server-side (tabla o Redis) para poder invalidarlos. Para producción se recomendaría:
- `access_token` de corta vida (15 min) en header `Authorization`
- `refresh_token` de larga vida (7 días) en cookie `httpOnly` + `Secure` + `SameSite=Strict`
- Endpoint `POST /auth/refresh` con estrategia JWT separada
- Rotación de refresh tokens en cada uso para detectar reusos maliciosos

### Soft delete
Todos los recursos (libros, autores, géneros, editoriales) usan soft delete mediante campo `deleted_at`. Permite restaurar registros eliminados y mantiene integridad referencial sin perder datos históricos.

### Auditoría
Cada mutación (crear, editar, eliminar) registra un `AuditLog` con acción, entidad, ID, metadata y usuario responsable. La escritura es fire-and-forget para no bloquear la respuesta al cliente.

### Exportación CSV
La exportación actual genera el archivo de forma sincrónica en memoria y lo devuelve directamente en la respuesta HTTP. Esto es viable para volúmenes pequeños de datos.

En producción con un catálogo grande el approach correcto sería asincrónico:

1. `POST /books/export` encola el trabajo en **SQS** (o similar) y responde inmediatamente con un `jobId`
2. Un worker consume la cola, genera el CSV y lo sube a S3
3. Al terminar, notifica al usuario por dos canales:
   - **Email** con el link de descarga firmado (S3 presigned URL con TTL)
   - **Notificación en la app** (WebSocket o polling) para mostrar un banner _"Tu exportación está lista"_ con botón de descarga

Esto evita timeouts HTTP en exports pesados y desacopla la generación del ciclo request/response.

### Almacenamiento de imágenes
Se usa MinIO como storage S3-compatible. En producción se reemplazaría la variable `MINIO_ENDPOINT` por un bucket de AWS S3 o similar sin cambios en el código.

### Validación con Zod y `packages/shared`
Los schemas de validación y los tipos TypeScript viven en `packages/shared` y son consumidos tanto por el backend (via `nestjs-zod`) como por el frontend (via `react-hook-form` + `@hookform/resolvers`). Un solo cambio en el schema se propaga a ambas capas sin duplicación.

```
packages/shared/
├── schemas/   # Zod schemas (validación de entrada, DTOs)
├── types/     # Tipos TypeScript inferidos de los schemas
└── constants/ # Endpoints de la API compartidos
```

### Screaming Architecture
Tanto el backend como el frontend siguen el principio de **Screaming Architecture** (Uncle Bob): la estructura de carpetas grita de qué trata el sistema, no qué framework usa. Al abrir `src/modules/` o `src/pages/` queda inmediatamente claro que esto es un gestor de libros, autores, editoriales y géneros.

Esto contrasta con estructuras técnicas del tipo `controllers/`, `services/`, `repositories/` donde hay que explorar múltiples carpetas para entender una sola funcionalidad. Aquí todo lo relacionado a un recurso vive junto:

```
modules/books/              pages/books/
├── books.controller.ts     ├── BooksPage.tsx
├── books.service.ts        ├── BookDetailPage.tsx
├── books.repository.ts     ├── BookFormModal.tsx
├── books.errors.ts         ├── BookCard.tsx
├── books.schema.ts         └── useBookColumns.tsx
└── docs/
```

### Patrón Repository
Cada módulo del backend separa la lógica de negocio de la capa de acceso a datos:

```
*.controller.ts   # Recibe HTTP, delega al servicio
*.service.ts      # Lógica de negocio, orquesta el repositorio
*.repository.ts   # Queries a Prisma, sin lógica de negocio
*.errors.ts       # Errores tipados del dominio
```

Esto facilita testear el servicio mockeando el repositorio, y el repositorio mockeando PrismaClient.

### Arquitectura del frontend

El frontend combina tres patrones:

**1. Feature-based en `pages/`**
Cada página agrupa todo lo relacionado a ese recurso: componente principal, columnas de tabla y modales específicos. Abrir `pages/books/` deja claro que ahí vive todo lo de libros.

**2. Atomic Design simplificado en `ui/`**
La capa de UI se organiza en dos niveles:
- `atoms/` — componentes primitivos sin lógica de negocio (Button, Input, Modal, Select, Toast)
- `organisms/` — componentes compuestos reutilizables (Table, Pagination, Sidebar)

No se usan moléculas ni templates del Atomic Design completo para evitar complejidad innecesaria.

**3. Separación service → hook → page**
Cada capa tiene una responsabilidad única:

```
services/books.service.ts   # fetch puro, sin estado (qué llamar y cómo)
hooks/useBooks.ts           # TanStack Query, caché y estado del servidor
pages/books/BooksPage.tsx   # UI, estado local, interacción del usuario
```

Esto permite reutilizar un hook en múltiples páginas y testear cada capa de forma aislada.

### Arquitectura modular NestJS
Cada recurso (auth, books, authors, genres, publishers, users, audit, storage) es un módulo NestJS independiente. Los módulos se componen en `AppModule` sin acoplamiento directo entre ellos, lo que permite agregar o remover funcionalidades sin efecto cascada.
