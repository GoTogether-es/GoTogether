---
tags: [backend, notifications, realtime]
---

# Sistema de Notificaciones

**Archivo principal:** `apps/api/src/modules/notifications/notifications.service.ts`
**Componente frontend:** [[frontend/components#notificationbell|NotificationBell]]
**Tests:** `notifications.service.spec.ts` (5 tests)

## Descripción

Sistema de notificaciones in-app con entrega en tiempo real vía Supabase Realtime. Los acompañantes y clientes reciben notificaciones instantáneas sobre cambios de estado en sus reservas, y los acompañantes reciben notificaciones cuando reciben valoraciones.

## Modelo

```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String      // booking_requested, booking_accepted, etc.
  title     String
  body      String
  bookingId String?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

## Tipos de notificación

| type | Icono | Color | Cuándo | Para quién |
|------|-------|-------|--------|------------|
| `booking_requested` | Mail | azul | Cliente solicita reserva | Acompañante |
| `booking_accepted` | CheckCircle2 | verde | Acompañante acepta | Cliente |
| `booking_declined` | XCircle | rojo | Acompañante rechaza | Cliente |
| `booking_completed` | PartyPopper | ámbar | Servicio completado | Cliente |
| `booking_cancelled` | Ban | rojo | Reserva cancelada | La otra parte |
| `rating_received` | Star | ámbar | Cliente valora | Acompañante |
| `completion_requested` | Bell | gris | Acompañante solicita finalizar | Cliente |
| `admin` | Bell | gris | Notificación masiva del admin | Usuarios por rol |

## Endpoints API

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/notifications` | JWT | Mis notificaciones (máx 50, orden DESC) |
| `GET` | `/notifications/unread-count` | JWT | Contador de no leídas |
| `PUT` | `/notifications/:id/read` | JWT | Marcar una como leída (scoped a userId) |
| `PUT` | `/notifications/read-all` | JWT | Marcar todas como leídas |

## Triggers automáticos

Las notificaciones se crean desde los servicios de negocio, no desde endpoints públicos:

### Desde `BookingsService`
```
requestBooking()     → booking_requested al compañero
updateStatus(ACCEPTED)  → booking_accepted al cliente
updateStatus(DECLINED)  → booking_declined al cliente
updateStatus(COMPLETED) → booking_completed al cliente
updateStatus(CANCELLED) → booking_cancelled al cliente (si cancela el compañero)
requestCompletion()     → completion_requested al cliente
completeByClient()      → booking_completed al compañero + al cliente
```

### Desde `ReportsService`
```
create() / update()  → rating_received al compañero
```

### Desde `AdminService`
```
sendMassNotification() → admin a todos los usuarios del rol especificado
```

## Realtime

La campanita (`NotificationBell`) se suscribe a `postgres_changes` en la tabla `Notification`:
```typescript
supabase
  .channel('notifications-bell')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Notification' }, () => load())
  .subscribe();
```

Cada INSERT en `Notification` dispara una recarga completa de la lista y el contador de no leídas.

## RLS en Notification

```sql
-- SELECT: solo el dueño (userId = auth.uid())
-- UPDATE: solo el dueño (marcar como leída)
```

## Frontend: NotificationBell

La campanita en la navbar muestra:
- Icono `Bell` con badge rojo (contador, máx "9+")
- Dropdown con lista: icono + color por tipo, título, body, timestamp relativo
- Click → marca como leída + navega a `/reservas`
- Botón "Marcar todas leídas"
- Estado vacío: "Sin notificaciones"

### Flujo de carga
1. Fetch inicial: `getNotifications()` + `getUnreadCount()`
2. Suscripción Realtime a INSERT en Notification
3. Auth state change: recarga o limpia según sesión
