---
tags: [testing, jest, quality]
---

# Testing

**Total:** 287 tests (163 API + 124 Web) en 46 suites

## Resumen

| Capa | Suites | Tests | Framework |
|------|:---:|:---:|-----------|
| **API** (NestJS) | 18 | 163 | Jest + ts-jest |
| **Web** (Next.js) | 28 | 124 | Jest + Testing Library + jsdom |
| **Total** | **46** | **287** | Jest 29.7.0 |

## Ejecutar tests

```bash
# Todos los tests del monorepo
pnpm test

# Solo API
pnpm --filter api test

# Solo Web
pnpm --filter web test

# Un archivo específico
pnpm --filter api test -- --testPathPattern="bookings"

# Solo tests fallidos
pnpm --filter web test -- --onlyFailures
```

## Estructura de tests

### API (`apps/api/src/`)

Los tests están co-locados con el código fuente:

```
modules/
├── availability/availability.service.spec.ts
├── bookings/bookings.service.spec.ts
├── reports/reports.service.spec.ts
├── supervision/supervision.service.spec.ts
├── admin/admin.service.spec.ts
├── profiles/profiles.service.spec.ts
├── chat/chat.service.spec.ts
├── matching/matching.service.spec.ts
├── notifications/notifications.service.spec.ts
├── services/services.service.spec.ts
├── users/users.service.spec.ts
├── payments/payments.service.spec.ts
├── auth/
│   ├── auth.service.spec.ts
│   ├── mail.service.spec.ts
│   ├── guards.spec.ts
│   └── supabase.strategy.spec.ts
└── app/
    ├── app.controller.spec.ts
    └── global-exception.filter.spec.ts
```

Patrón de nombres: `**/*.spec.ts`

### Web (`apps/web/src/`)

Los tests están en carpetas `__tests__/` co-localizadas:

```
app/
├── __tests__/home.test.tsx
├── explorar/__tests__/explorar.test.tsx
├── panel/__tests__/panel.test.tsx
├── reservas/__tests__/reservas.test.tsx
├── supervision/__tests__/supervision.test.tsx
├── solicitud/__tests__/solicitud.test.tsx
├── coordinacion/__tests__/coordinacion.test.tsx
└── __tests__/middleware.test.ts

components/__tests__/
├── app-shell.test.tsx
├── availability-grid.test.tsx
├── companion-card.test.tsx
├── confirm-dialog.test.tsx
├── faq-accordion.test.tsx
├── step-indicator.test.tsx
├── breadcrumbs.test.tsx
├── skeleton.test.tsx
├── scroll-to-cta.test.tsx
├── route-announcer.test.tsx
├── file-upload.test.tsx
├── avatar-upload.test.tsx
└── client-location-map.test.tsx

hooks/__tests__/
└── use-api.test.tsx

lib/__tests__/
├── schemas.test.ts
├── levels.test.ts
├── routes.test.ts
└── env.test.ts

services/__tests__/
├── api-schemas.test.ts
└── queries.test.tsx
```

Patrón de nombres: `**/*.test.{ts,tsx}`

## Infraestructura de test

### Mocks compartidos

| Archivo | Propósito |
|---------|-----------|
| `apps/api/src/__mocks__/prisma.ts` | `createMockPrismaService()` — recrea todos los modelos de Prisma como `jest.fn()` frescos por test |
| `apps/api/src/__mocks__/resend.ts` | Mock del SDK de Resend |
| `apps/api/src/test-utils/factories.ts` | 8 factories: `mockUser()`, `mockProfile()`, `mockBooking()`, `mockCompanionProfile()`, `mockService()`, `mockReport()`, `mockSupervision()`, `mockSupervisionInvite()` — con overrides parciales |
| `apps/api/src/test-utils/services.ts` | Mocks de `ConfigService`, `NotificationsService`, `MailService`, `ChatService`, `AvailabilityService` |

### Setup global

| Archivo | Propósito |
|---------|-----------|
| `apps/web/jest.setup.tsx` | `@testing-library/jest-dom`, mocks de `next/image`, `next/navigation`, Supabase, API functions, polyfills (matchMedia, IntersectionObserver, ResizeObserver) |

### Configuración

| Archivo | Framework | Environment |
|---------|-----------|-------------|
| `apps/api/jest.config.cjs` | ts-jest | node |
| `apps/api/tsconfig.spec.json` | TypeScript para specs | — |
| `apps/web/jest.config.cjs` | next/jest (SWC) | jsdom |
| `apps/api/tsconfig.build.json` | Excluye `__mocks__/**` y `test-utils/**` del build | — |

## Cobertura por servicio backend

| Servicio | Tests | Áreas cubiertas |
|----------|:---:|-----------------|
| **BookingsService** | 30 | State machine (7 transiciones), CRUD, permisos, stats, history |
| **SupervisionService** | 15 | create, invite, accept, cancel, bookings agregados |
| **AdminService** | 12 | Stats, verify, reject, mass notifications, bookings, services |
| **ReportsService** | 11 | create, update, recalculateRating, permisos |
| **ProfilesService** | 11 | upsert (3 roles), getCompanionById, listCompanions |
| **ChatService** | 8 | getOrCreateRoom, saveMessage, createRoomForBooking, validación participantes |
| **MatchingService** | 7 | Filtros combinados, paginación, meta.totalPages |
| **AvailabilityService** | 6 | get/set, isCompanionAvailable, timezone, validación |
| **NotificationsService** | 5 | CRUD, count, mark read |
| **ServicesService** | 5 | listActive/All, create, update |
| **Guards** | 11 | AdminGuard (4), RolesGuard (4), Roles decorator (2) |
| **AuthService** | 3 | validateAndSyncUser, logout |
| **MailService** | 4 | send (con/sin config), skip |
| **PaymentsService** | 5 | hold, capture, release, webhook |
| **UsersService** | 3 | list, search, empty |
| **Strategy** | 4 | validate (con/sin user), construction |
| **ExceptionFilter** | 7 | HttpException, object message, unknown error, production mode |

## CI/CD

El pipeline de GitHub Actions (`.github/workflows/ci.yml`) ejecuta:
1. `lint-and-typecheck` → 2. `test` → 3. `build`

Matrix para ambos apps (`api`, `web`). Usa pnpm 10, Node.js 20.

## Convenciones

- **Backend:** `.spec.ts`, tests co-localizados con el código, mock manual de Prisma
- **Frontend:** `.test.ts(x)`, carpeta `__tests__/` co-localizada, Testing Library queries
- **Naming:** `describe('ServiceName', () => { describe('methodName', () => { it('does X', ...) }) })`
- **Factories:** siempre aceptan `overrides` parciales como último argumento
- **Mocks:** `jest.clearAllMocks()` en `beforeEach` global
