---
tags: [backend, api, endpoints, rest]
---

# API Endpoints

Lista completa de todos los endpoints REST del backend NestJS.

## Auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/magic-link` | Ninguna | Enviar enlace mágico por email |
| GET | `/auth/me` | JWT | Validar y sincronizar usuario |
| POST | `/auth/logout` | JWT | Cerrar sesión |

## Users

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/users?search=` | JWT | Listar/buscar usuarios |

## Profiles

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/profiles/me` | JWT | Obtener perfil propio |
| PUT | `/profiles/me` | JWT | Crear/actualizar perfil |
| GET | `/profiles/companions` | Ninguna | Listar acompañantes verificados |
| GET | `/profiles/companions/:id` | Ninguna | Detalle de acompañante |

## Bookings

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/bookings` | JWT | Crear reserva (DRAFT) |
| GET | `/bookings/me` | JWT | Mis reservas |
| GET | `/bookings/open` | JWT | Reservas abiertas (marketplace) |
| GET | `/bookings/:id` | JWT | Detalle de reserva |
| PUT | `/bookings/:id/request` | JWT | Solicitar (DRAFT → REQUESTED) |
| PUT | `/bookings/:id/status` | JWT | Cambiar estado |
| PUT | `/bookings/:id/request-completion` | JWT | Acompañante solicita finalizar (notifica al cliente) |
| PUT | `/bookings/:id/complete` | JWT | Cliente confirma finalización → COMPLETED |

### Body de `PUT /bookings/:id/status`
```json
{ "status": "ACCEPTED | DECLINED | IN_PROGRESS | COMPLETED | CANCELLED" }
```

### Body de `POST /bookings`
```json
{
  "serviceType": "Acompañamiento médico",
  "serviceId": "uuid-opcional (catálogo de servicios)",
  "address": "Calle Mayor 1, Madrid",
  "scheduledAt": "2026-06-01T10:00:00.000Z",
  "summary": "Notas opcionales",
  "disability": "Movilidad reducida",
  "companionId": "uuid-opcional"
}
```

## Bookings (historial y stats)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/bookings/history?page=&limit=&status=` | JWT | Historial paginado |
| GET | `/bookings/stats` | JWT | Estadísticas (completadas, valoración media) |

## Services

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/services` | Ninguna | Catálogo de servicios activos |
| GET | `/services/all` | JWT | Todos los servicios (incluye inactivos) |

## Availability

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/companions/:id/availability` | JWT | Disponibilidad semanal |
| PUT | `/availability` | JWT | Guardar disponibilidad semanal |

## Matching

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/matching/recommendations?search=&disabilityType=&minRating=&verified=&page=&limit=` | Ninguna | Buscar acompañantes |

## Chat

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/chat/room/:bookingId` | JWT | Obtener sala + mensajes |
| POST | `/chat/room/:bookingId/messages` | JWT | Enviar mensaje (REST, legado) |

## Reports

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/reports` | JWT | Mis valoraciones |
| GET | `/reports/booking/:bookingId` | JWT | Valoración de una reserva |
| POST | `/reports/:bookingId` | JWT | Crear valoración |
| PUT | `/reports/:id` | JWT | Editar valoración |

### Body de `POST /reports/:bookingId`
```json
{ "rating": 5, "summary": "Excelente servicio" }
```

## Supervision

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/supervision` | JWT | Vincular con cliente |
| POST | `/supervision/invite` | JWT | Invitar por email |
| GET | `/supervision/accept?token=` | Ninguna | Aceptar invitación |
| GET | `/supervision/invites` | JWT | Invitaciones pendientes |
| DELETE | `/supervision/invite/:id` | JWT | Cancelar invitación |
| GET | `/supervision/clients` | JWT | Clientes supervisados |
| GET | `/supervision/supervisor` | JWT | Mi supervisor |
| DELETE | `/supervision/:id` | JWT | Eliminar supervisión |
| GET | `/supervision/bookings?page=&limit=` | JWT | Reservas de clientes supervisados |

## Payments (deshabilitado)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/payments/hold` | JWT | Crear retención Stripe |
| POST | `/payments/:id/capture` | JWT | Capturar pago |
| POST | `/payments/:id/release` | JWT | Liberar retención |
| POST | `/payments/webhook` | Ninguna | Webhook de Stripe |

## Notifications

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/notifications` | JWT | Mis notificaciones |
| GET | `/notifications/unread-count` | JWT | Contador no leídas |
| PUT | `/notifications/:id/read` | JWT | Marcar leída |
| PUT | `/notifications/read-all` | JWT | Marcar todas leídas |

## Admin

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/admin/stats` | x-admin-key | Estadísticas dashboard |
| GET | `/admin/users` | x-admin-key | Todos los usuarios |
| GET | `/admin/pending` | x-admin-key | Pendientes de verificar |
| PUT | `/admin/companions/:id/verify` | x-admin-key | Verificar acompañante |
| PUT | `/admin/companions/:id/reject` | x-admin-key | Rechazar acompañante |
| PUT | `/admin/profiles/:id/verify` | x-admin-key | Verificar cliente |
| PUT | `/admin/profiles/:id/reject` | x-admin-key | Rechazar cliente |
| GET | `/admin/bookings` | x-admin-key | Reservas paginadas (?status=, ?page=) |
| GET | `/admin/bookings/:id` | x-admin-key | Detalle reserva con chat y pagos |
| PUT | `/admin/bookings/:id/status` | x-admin-key | Cambiar estado de reserva |
| GET | `/admin/services` | x-admin-key | Catálogo de servicios |
| POST | `/admin/services` | x-admin-key | Crear servicio |
| PUT | `/admin/services/:id` | x-admin-key | Editar servicio |
| PUT | `/admin/services/:id/toggle` | x-admin-key | Activar/desactivar servicio |
| GET | `/admin/payments` | x-admin-key | Pagos paginados |
| GET | `/admin/reports` | x-admin-key | Valoraciones paginadas |
| DELETE | `/admin/reports/:id` | x-admin-key | Eliminar valoración |
| POST | `/admin/notifications` | x-admin-key | Enviar notificación masiva |

## Totales

- **Endpoints totales:** 49
- **Protegidos (JWT):** 35
- **Protegidos (admin key):** 18
- **Públicos:** 8 (magic-link, companions, matching, services, supervision accept, webhook)

## Formato de errores

Todos los errores siguen el formato del `GlobalExceptionFilter`:

```json
{
  "statusCode": 400,
  "message": ["Descripción del error"],
  "path": "/bookings/abc",
  "timestamp": "2026-05-19T10:00:00.000Z"
}
```
