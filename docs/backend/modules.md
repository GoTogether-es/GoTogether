---
tags: [backend, nestjs, modules]
---

# Módulos del Backend

El backend está organizado en 13 módulos NestJS bajo `apps/api/src/modules/`. Cada módulo sigue el patrón: `controller.ts` (rutas), `service.ts` (lógica), `module.ts` (registro DI), y opcionalmente `dto/` (validación).

## Mapa de módulos

```
AppModule
├── PrismaModule (servicio de BD global)
├── ConfigModule (variables de entorno, global)
├── ThrottlerModule (rate limiting global)
├── AuthModule (magic link, guards, estrategia JWT)
├── UsersModule (listado de usuarios)
├── ProfilesModule (gestión de perfiles)
├── BookingsModule (reservas y máquina de estados)
│   ├── ChatModule (salas de chat y mensajes)
│   └── NotificationsModule (notificaciones in-app)
├── MatchingModule (búsqueda y recomendaciones)
├── ReportsModule (valoraciones y ratings)
├── SupervisionModule (supervisores y clientes)
├── PaymentsModule (Stripe, deshabilitado en alpha)
├── AdminModule (panel de administración)
└── NotificationsModule (notificaciones)
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
- `mail.templates.ts` — plantillas HTML para emails (magic link, invitación supervisión)

> [!note] `@Roles()` y `RolesAuthGuard` están definidos pero no se aplican en ningún endpoint. Se usará en el futuro para endpoints de admin y supervisor.

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

## UsersModule

**Archivos:** `users/`

- `GET /users?search=` — Lista usuarios con búsqueda por email o nombre
- Usado por la página de supervisión para buscar clientes

## ProfilesModule

**Archivos:** `profiles/`

- `GET /profiles/me` — Obtener perfil propio
- `PUT /profiles/me` — Upsert de perfil (crea/actualiza)
- `GET /profiles/companions` — Listar acompañantes verificados (público)
- `GET /profiles/companions/:id` — Detalle de acompañante con ratings

El upsert de perfil maneja automáticamente el rol del usuario:
- Si `isCompanion: true` → actualiza `User.role = COMPANION`, crea `CompanionProfile`
- Si no → actualiza `User.role = CLIENT` (excepto SUPERVISOR/ADMIN)

## BookingsModule

**Archivos:** `bookings/`

Endpoints:
- `POST /bookings` — Crear reserva DRAFT
- `GET /bookings/me` — Mis reservas (rol-aware: companion ve por companionId, client por clientId)
- `GET /bookings/open` — Reservas REQUESTED sin compañero asignado (marketplace)
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
3. Que el usuario sea el cliente, acompañante asignado o supervisor

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
- `search`: busca en nombre, headline, bio, specialties, disabilityType
- `disabilityType`: filtra por tipo de discapacidad
- `minRating`: rating mínimo
- `verified`: solo verificados (default: true en el frontend)

Ordenado por: rating DESC, yearsOnPlatform DESC.

## ReportsModule

**Archivos:** `reports/`

- `GET /reports` — Listar valoraciones del usuario
- `GET /reports/booking/:bookingId` — Ver valoración de una reserva
- `POST /reports/:bookingId` — Crear valoración (solo COMPLETED, solo cliente/supervisor)
- `PUT /reports/:id` — Editar valoración

Al crear/editar: recalcula automáticamente `CompanionProfile.rating` y `yearsOnPlatform`.

## SupervisionModule

**Archivos:** `supervision/`

- `POST /supervision` — Vincular directamente con un cliente existente
- `POST /supervision/invite` — Enviar invitación por email
- `GET /supervision/accept?token=` — Aceptar invitación
- `GET /supervision/invites` — Invitaciones pendientes
- `DELETE /supervision/invite/:id` — Cancelar invitación
- `GET /supervision/clients` — Clientes supervisados
- `GET /supervision/supervisor` — Mi supervisor
- `DELETE /supervision/:id` — Eliminar supervisión

## PaymentsModule

**Archivos:** `payments/`

- `POST /payments/hold` — Crear PaymentIntent (autorización sin captura)
- `POST /payments/:id/capture` — Capturar pago
- `POST /payments/:id/release` — Liberar autorización
- `POST /payments/webhook` — Webhook de Stripe (recibe pero no procesa)

> [!warning] **Pagos deshabilitados en alpha.** `BookingsModule` no usa `PaymentsModule`. Las reservas se crean sin Payment record. Cuando se reactive Stripe, hay que:
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

## PrismaModule

**Archivos:** `prisma/`

Módulo global que proporciona `PrismaService` (wrapper de Prisma Client) a todos los demás módulos. Configurado como `@Global()`.
