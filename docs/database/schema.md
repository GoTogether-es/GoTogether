---
tags: [database, prisma, postgresql, rls, realtime]
---

# Esquema de base de datos

El esquema está definido en `apps/api/prisma/schema.prisma` y se sincroniza con PostgreSQL en Supabase. El ORM es Prisma 5.x.

## Resumen de modelos (14 tablas)

| Modelo | Tabla | Propósito |
|--------|-------|-----------|
| `User` | User | Usuarios del sistema (auth vía Supabase) |
| `Profile` | Profile | Perfil personal (nombre, bio, avatar, discapacidad) |
| `CompanionProfile` | CompanionProfile | Perfil de acompañante (especialidades, certificados, verificación) |
| `Booking` | Booking | Reservas de servicios (máquina de estados) |
| `Payment` | Payment | Pagos (Stripe, deshabilitado en alpha) |
| `ChatRoom` | ChatRoom | Salas de chat por reserva |
| `ChatMessage` | ChatMessage | Mensajes del chat |
| `Report` | Report | Valoraciones (1-5 estrellas + comentario) |
| `Service` | Service | Catálogo de servicios con nombre, precio, categoría |
| `AvailabilitySlot` | AvailabilitySlot | Disponibilidad semanal del acompañante |
| `ClientLocation` | ClientLocation | Ubicación en tiempo real del cliente |
| `Supervision` | Supervision | Relación supervisor-cliente |
| `SupervisionInvite` | SupervisionInvite | Invitaciones de supervisión |
| `Notification` | Notification | Notificaciones in-app |


## Enums

```prisma
enum UserRole { CLIENT, COMPANION, SUPERVISOR, ADMIN }
enum BookingStatus { DRAFT, REQUESTED, ACCEPTED, DECLINED, IN_PROGRESS, COMPLETED, CANCELLED }
```

## Modelo User

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  role      UserRole @default(CLIENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

- `id`: UUID generado por Supabase Auth (no por Prisma)
- `email`: email del usuario
- `role`: CLIENT por defecto, cambia a COMPANION al registrarse como acompañante

### Relaciones
- `profile` → Profile (1:1)
- `bookings` → Booking[] como cliente
- `bookedBookings` → Booking[] como supervisor que crea reservas
- `supervisedClients` → Supervision[] como supervisor
- `supervisorRef` → Supervision como cliente supervisado
- `sentInvites` → SupervisionInvite[]

## Modelo Profile

```prisma
model Profile {
  id                   String   @id @default(uuid())
  userId               String   @unique
  fullName             String
  headline             String?
  bio                  String?
  phone                String?
  avatarUrl            String?
  disabilityType       String?
  disabilityDescription String?
  disabilityDocument   String?
  preferences          String?
  verified             Boolean  @default(false)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

- `verified`: admin marca como verificado tras revisar `disabilityDocument`
- `avatarUrl`: URL pública de Supabase Storage (bucket `avatars`)
- `disabilityDocument`: URL pública de Supabase Storage (bucket `certificates`)

## Modelo CompanionProfile

```prisma
model CompanionProfile {
  id                String   @id @default(uuid())
  profileId         String   @unique
  specialties       String?
  verified          Boolean  @default(false)
  backgroundCheck   String?
  sexualCheck       String?
  penalCertificate  String?
  sexualCertificate String?
  rating            Float    @default(0)
  yearsOnPlatform   Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

- `verified`: admin marca como verificado tras revisar certificados penales y sexuales
- `penalCertificate` / `sexualCertificate`: URLs de Supabase Storage (bucket `certificates`)
- `rating`: recalculado automáticamente al recibir valoraciones
- `yearsOnPlatform`: recalculado desde `createdAt`

## Modelo Booking

```prisma
model Booking {
  id            String        @id @default(uuid())
  clientId      String
  companionId   String?
  bookedById    String?
  status        BookingStatus @default(DRAFT)
  serviceType   String
  summary       String?
  address       String
  scheduledAt   DateTime
  disability    String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}
```

### Máquina de estados

```
DRAFT ──→ REQUESTED ──→ ACCEPTED ──→ IN_PROGRESS ──→ COMPLETED
  │           │              │              │
  └──→ CANCELLED ←──────────┴──────────────┘
              ↑
         DECLINED (terminal)
```

Transiciones definidas en `bookings.service.ts` con validación de roles:

| De | A | Quién |
|----|---|-------|
| DRAFT | REQUESTED | Cliente (al confirmar solicitud) |
| DRAFT | CANCELLED | Cliente |
| REQUESTED | ACCEPTED | Acompañante asignado |
| REQUESTED | DECLINED | Acompañante asignado |
| REQUESTED | CANCELLED | Cliente o acompañante |
| ACCEPTED | IN_PROGRESS | Acompañante |
| ACCEPTED | CANCELLED | Cualquiera |
| IN_PROGRESS | COMPLETED | Cliente o acompañante |
| IN_PROGRESS | CANCELLED | Cualquiera |

## Modelo Notification

```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String
  title     String
  body      String
  bookingId String?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

### Tipos de notificación

| type | Cuándo se dispara | Para quién |
|------|------------------|------------|
| `booking_requested` | Cliente solicita reserva | Acompañante |
| `booking_accepted` | Acompañante acepta | Cliente |
| `booking_declined` | Acompañante rechaza | Cliente |
| `booking_completed` | Servicio completado | Cliente |
| `booking_cancelled` | Reserva cancelada | La otra parte |
| `rating_received` | Cliente valora | Acompañante |

## Row Level Security (RLS)

### ChatMessage
```sql
-- SELECT: solo participantes del booking pueden leer mensajes
-- INSERT: solo participantes del booking pueden insertar mensajes
-- Verificación: clientId, bookedById, o companionId → userId
```

### Notification
```sql
-- SELECT: solo el dueño (userId = auth.uid())
-- UPDATE: solo el dueño (marcar como leída)
```

### Storage buckets
```sql
-- certificates: SELECT público, INSERT authenticated
-- avatars: SELECT público, INSERT/UPDATE/DELETE authenticated
```

## Supabase Realtime

Tablas con replicación activada para Realtime:
- `ChatMessage` — mensajes en tiempo real
- `Notification` — notificaciones push instantáneas
- `ClientLocation` — ubicación en tiempo real de clientes

La replicación se activó con:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE "ChatMessage";
ALTER PUBLICATION supabase_realtime ADD TABLE "Notification";
ALTER PUBLICATION supabase_realtime ADD TABLE "ClientLocation";
```

## Modelos nuevos

### Service
```prisma
model Service {
  id          String   @id @default(uuid())
  name        String
  description String?
  price       Int      @default(0)       // en céntimos
  category    String?
  active      Boolean  @default(true)
  bookings    Booking[]
}
```

### AvailabilitySlot
```prisma
model AvailabilitySlot {
  id           String @id @default(uuid())
  companionId  String
  dayOfWeek    Int
  startTime    String
  endTime      String
  companion    CompanionProfile @relation(fields: [companionId], references: [id])
}
```

### ClientLocation
```prisma
model ClientLocation {
  id        String   @id @default(uuid())
  clientId  String   @unique
  latitude  Float
  longitude Float
  accuracy  Float?
  timestamp DateTime @default(now())
  client    User     @relation(fields: [clientId], references: [id])
}
```

## RLS actualizado

RLS activado en **13 tablas** (todas). Políticas definidas en:
- `ChatMessage` — solo participantes de la sala
- `Notification` — solo el destinatario
- `ClientLocation` — dueño + supervisor

Las otras 10 tablas tienen RLS habilitado sin políticas (acceso solo vía NestJS/Prisma con conexión directa, bypass RLS).

## Relaciones del esquema completo

```
User ──1:1── Profile ──1:0..1── CompanionProfile
  │           │                        │
  │           │                        ├── 1:N ── AvailabilitySlot
  │           │                        │
  │ 1:N (clientId)                     │ 1:N (companionId)
  │           │                        │
  └──→ Booking ←───────────────────────┘
         │
         ├── 1:0..1 ── Payment
         ├── 1:0..1 ── ChatRoom ── 1:N ── ChatMessage
         ├── 1:0..1 ── Report
         └── N:1 ── Service

User ──1:N── Supervision (supervisorId)
User ──1:1── Supervision (clientId)
User ──1:N── SupervisionInvite (supervisorId)
```
