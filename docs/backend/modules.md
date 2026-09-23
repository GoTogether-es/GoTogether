---
tags: [backend, nestjs, modules]
---

# Módulos del Backend

El backend está organizado en 14 módulos NestJS bajo `apps/api/src/modules/`. Cada módulo sigue el patrón: `controller.ts` (rutas), `service.ts` (lógica), `module.ts` (registro DI), y opcionalmente `dto/` (validación).

## Mapa de módulos

```
AppModule
├── PrismaModule (servicio de BD global)
├── ConfigModule (variables de entorno, global)
├── ThrottlerModule (rate limiting global)
├── AuthModule (magic link, guards, estrategia JWT)
├── ProfilesModule (gestión de perfiles)
├── BookingsModule (reservas y máquina de estados)
│   ├── ChatModule (salas de chat y mensajes)
│   └── NotificationsModule (notificaciones in-app)
├── MatchingModule (búsqueda y recomendaciones)
├── ReportsModule (valoraciones y ratings)
├── PaymentsModule (Stripe, deshabilitado en alpha)
├── AdminModule (panel de administración)
├── ServicesModule (catálogo de servicios)
├── AvailabilityModule (disponibilidad semanal de acompañantes)
└── LocationModule (geocodificación, sin controller)
```

## AuthModule

**Archivos:** `auth/`

- `auth.controller.ts` — `POST /auth/magic-link`, `GET /auth/me`, `POST /auth/logout`
- `auth.service.ts` — validación JWT Supabase, sync de usuarios, envío de magic links
- `supabase.strategy.ts` — estrategia Passport JWT con validación JWKS de Supabase
- `supabase-auth.guard.ts` — guard que aplica la estrategia Supabase
- `admin.guard.ts` — guard para admin (header `x-admin-key`)
- `roles.guard.ts` — guard y decorador `@Roles()` para RBAC
- `roles-auth.guard.ts` — guard combinado JWT + roles
- `mail.templates.ts` — plantillas HTML para emails (magic link y transaccionales)

> [!note] `@Roles()` y `RolesAuthGuard` son funcionales desde v0.1.1-alpha. `SupabaseJwtStrategy.validate()` consulta la BD para incluir `role` en `req.user`. Los guards se aplican en los endpoints que requieren RBAC (por ejemplo, acciones de acompañante).

### Flujo de autenticación

```
1. POST /auth/magic-link { email }
2. Resend envía email con link mágico
3. Supabase Auth valida el token y crea sesión
4. Frontend recibe JWT de Supabase
5. Cada petición al backend incluye `Authorization: Bearer <jwt>`
6. SupabaseAuthGuard valida el JWT contra JWKS de Supabase
7. req.user = { userId, email }
```

## ProfilesModule

**Archivos:** `profiles/`

- `GET /profiles/me` — Obtener perfil propio
- `PUT /profiles/me` — Upsert de perfil (crea/actualiza)
- `GET /profiles/companions` — Listar acompañantes verificados (público)
- `GET /profiles/companions/:id` — Detalle de acompañante con ratings

El upsert de perfil maneja automáticamente el rol del usuario:
- Si `isCompanion: true` → actualiza `User.role = COMPANION`, crea `CompanionProfile`
- Si no → actualiza `User.role = CLIENT` (excepto ADMIN)

## BookingsModule

**Archivos:** `bookings/`

Endpoints:
- `POST /bookings` — Crear reserva DRAFT
- `GET /bookings/me` — Mis reservas (rol-aware: companion ve por companionId, client por clientId)
- `GET /bookings/:id` — Detalle de reserva
- `PUT /bookings/:id/request` — DRAFT → REQUESTED
- `PUT /bookings/:id/status` — Transiciones de estado con permisos por rol

### Máquina de estados

Las transiciones válidas están en `VALID_TRANSITIONS`:

```typescript
DRAFT       → REQUESTED (cliente), CANCELLED
REQUESTED   → ACCEPTED (acompañante), DECLINED, CANCELLED
ACCEPTED    → IN_PROGRESS (acompañante), CANCELLED
IN_PROGRESS → COMPLETED (cualquiera), CANCELLED
```

Cada transición valida:
1. Que el estado destino sea válido desde el actual
2. Que el usuario tenga el rol adecuado
3. Que el usuario sea el cliente o acompañante asignado

Al aceptar (`canClaim`), se asigna automáticamente `companionId` al booking y se crea un `ChatRoom`.

## ChatModule

**Archivos:** `chat/`

- `GET /chat/room/:bookingId` — Obtener o crear sala + mensajes (REST)
- `POST /chat/room/:bookingId/messages` — Enviar mensaje vía REST

> [!note] El envío de mensajes en producción se hace directamente desde el frontend via `supabase.from('ChatMessage').insert()` con RLS. El endpoint REST es fallback/legado.

**Realtime:** El frontend se suscribe a `postgres_changes` en `ChatMessage` filtrado por `roomId`. Los mensajes llegan en < 100ms.

## NotificationsModule

**Archivos:** `notifications/`

- `GET /notifications` — Listar notificaciones del usuario
- `GET /notifications/unread-count` — Contador de no leídas
- `PUT /notifications/:id/read` — Marcar una como leída
- `PUT /notifications/read-all` — Marcar todas como leídas

**Triggers automáticos** desde `bookings.service.ts` y `reports.service.ts`:
- Nueva solicitud → notifica al acompañante
- Aceptada/rechazada → notifica al cliente
- Completada → notifica al cliente para valorar
- Cancelada → notifica al cliente
- Nueva valoración → notifica al acompañante

**Realtime:** la campanita se suscribe a `postgres_changes` en `Notification` para recibir notificaciones instantáneas.

## MatchingModule

**Archivos:** `matching/`

- `GET /matching/recommendations` — Búsqueda paginada de acompañantes

Filtros disponibles:
- `search`: busca en nombre, headline, bio (case insensitive)
- `disabilityType`: filtra por tipo de discapacidad
- `minRating`: rating mínimo
- `verified`: solo verificados (default: true en el frontend)

Lógica de filtro refactorizada (Mayo 2026): condiciones de búsqueda y discapacidad se acumulan en `profileConditions[]` con `AND`, eliminando el bloque duplicado que sobreescribía resultados. Documentación completa: [backend/matching](matching.md).

Ordenado por: rating DESC, yearsOnPlatform DESC.

## ReportsModule

**Archivos:** `reports/`

- `GET /reports` — Listar valoraciones del usuario
- `GET /reports/booking/:bookingId` — Ver valoración de una reserva
- `POST /reports/:bookingId` — Crear valoración (solo COMPLETED, solo cliente)
- `PUT /reports/:id` — Editar valoración

Al crear/editar: recalcula automáticamente `CompanionProfile.rating` y `yearsOnPlatform`.

## PaymentsModule

**Archivos:** `payments/`

- `POST /payments/hold` — Crear PaymentIntent (autorización sin captura)
- `POST /payments/:id/capture` — Capturar pago
- `POST /payments/:id/release` — Liberar autorización
- `POST /payments/webhook` — Webhook de Stripe (recibe pero no procesa)

> [!warning] **Pagos deshabilitados en alpha.** `BookingsModule` no usa `PaymentsModule`. Las reservas se crean sin Payment record. `PaymentsService` usa `ConfigService` para `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`. Cuando se reactive Stripe, hay que:
> 1. Configurar `STRIPE_SECRET_KEY` real en Vercel
> 2. Inyectar `PaymentsService` en `BookingsService`
> 3. Crear PaymentIntent al aceptar, capturar al completar, liberar al cancelar

## AdminModule

**Archivos:** `admin/`

Protegido por `AdminGuard` (header `x-admin-key`).

- `GET /admin/stats` — Contadores del dashboard
- `GET /admin/users` — Todos los usuarios con perfil
- `GET /admin/pending` — Compañantes y clientes pendientes de verificar
- `PUT /admin/companions/:id/verify` — Verificar acompañante
- `PUT /admin/companions/:id/reject` — Rechazar acompañante
- `PUT /admin/profiles/:id/verify` — Verificar cliente
- `PUT /admin/profiles/:id/reject` — Rechazar cliente

## ServicesModule

**Archivos:** `services/`

- `GET /services` — Listar servicios activos
- `GET /services/all` — Todos los servicios (incluye inactivos, JWT)
- `POST /services` — Crear servicio
- `PUT /services/:id` — Actualizar servicio

## AvailabilityModule

**Archivos:** `availability/`

- `GET /companions/:id/availability` — Disponibilidad semanal de un acompañante
- `PUT /availability` — Guardar disponibilidad

Documentación completa: [backend/availability](availability.md)

## LocationModule

**Archivos:** `location/`

Módulo con controller público y servicio de geocodificación:

- **Controller:** `LocationController` — `GET /location/geocode?q=` (autocompletar de direcciones reales, cacheado 1h, rate-limit 1 req/s según política Nominatim).
- **Service:** `GeocodingService` — geocodifica `city + fullAddress` a `{ latitude, longitude }` usando Nominatim (OpenStreetMap, `countrycodes=es`).
- Cache en memoria (`Map`) para búsquedas y geocodificación completa.
- Respeta política de uso de Nominatim: mínimo 1s entre peticiones (rate-limit interno).
- Usado por `ProfilesModule` en `upsertProfile`: si el cliente no envía coordenadas verificadas, se intenta geocodificar; si falla → **rechaza con 400** (dirección no existe).

## PrismaModule

**Archivos:** `prisma/`

Módulo global que proporciona `PrismaService` (wrapper de Prisma Client) a todos los demás módulos. Configurado como `@Global()`.
