---
tags: [frontend, flows, ux]
---

# Flujos de usuario

## 1. Registro de cliente

```
/ → Entrar → /auth/login (email)
  → /auth/verify (callback Supabase)
  → /auth/redirect (sin perfil → /onboarding)
  → /onboarding (click "Cliente")
  → /onboarding/register/client
     ├─ Nombre, teléfono, bio
     ├─ Tipo de discapacidad (select)
     ├─ Descripción
     └─ Subir documento acreditativo (FileUpload → Supabase Storage)
  → upsertProfile({ isCompanion: false, ... })
  → /explorar
```

## 2. Registro de acompañante

```
/ → Entrar → /auth/login (email)
  → /auth/verify
  → /auth/redirect → /onboarding
  → /onboarding (click "Acompañante")
  → /onboarding/register/companion
     ├─ Nombre, teléfono, bio
     ├─ Especialidades
     ├─ Subir certificado penal (FileUpload)
     └─ Subir certificado delitos sexuales (FileUpload)
  → upsertProfile({ isCompanion: true, ... })
  → /panel (dashboard, verificación pendiente)
```

> [!note] Tras el registro, el acompañante ve un banner amarillo "Documentos en revisión". No será visible en `/explorar` hasta que un admin apruebe sus documentos desde `/admin`.

## 3. Solicitud de reserva (cliente)

```
/explorar → busca/filtra acompañantes
  → click en tarjeta → /explorar/:id (detalle)
  → click "Solicitar acompañante"
  → /solicitud?companionId=X
     ├─ Tipo de servicio
     ├─ Fecha y hora
     ├─ Dirección
     ├─ Discapacidad (opcional)
     └─ Notas (opcional)
  → createBooking({ companionId, ... }) → DRAFT
  → requestBooking(id) → REQUESTED
  → notifica al acompañante
  → /reservas (el cliente ve su reserva como REQUESTED)
```

## 4. Aceptación de reserva (acompañante)

```
/panel → sección "Solicitudes abiertas"
  → ve solicitud con: nombre cliente, servicio, fecha, dirección
  → click "Aceptar"
     ├─ PUT /bookings/:id/status { status: "ACCEPTED" }
     ├─ companionId asignado al booking
     ├─ ChatRoom creado
     └─ notifica al cliente
  → la reserva pasa a "Mis servicios"
  → click "Chat" → /coordinacion/:id (chat en tiempo real)
```

### Flujo alternativo: rechazar
```
/panel → click "Rechazar" (X)
  → PUT /bookings/:id/status { status: "DECLINED" }
  → notifica al cliente
```

## 5. Chat en tiempo real

```
/coordinacion/[bookingId] → carga inicial (REST)
  ├─ GET /chat/room/:bookingId → room + messages
  └─ GET /bookings/:id → detalles reserva
  → suscripción Supabase Realtime
     └─ canal postgres_changes en ChatMessage filtrado por roomId

Enviar mensaje:
  → escribir texto + Enter
  → supabase.from('ChatMessage').insert({ roomId, senderId, content })
  → RLS verifica que el usuario es participante del booking
  → INSERT en BD
  → Realtime empuja el mensaje a ambos usuarios (< 100ms)

Recibir mensaje:
  → callback postgres_changes (INSERT)
  → añadir al estado local (dedup por id)
  → scroll al final del contenedor del chat
```

## 6. Completar y valorar

```
/panel o /reservas → reserva en estado ACCEPTED
  → click "Iniciar" → IN_PROGRESS
  → click "Completar" → COMPLETED
     └─ notifica al cliente para valorar

Cliente:
  /reservas → reserva COMPLETED → click "Valorar"
  → /valoracion/:bookingId
     ├─ Estrellas 1-5
     └─ Comentario (opcional)
  → POST /reports/:bookingId
  → recalcula rating del acompañante
  → notifica al acompañante
```

## 7. Verificación de documentos (admin)

```
/admin → introduce contraseña
  → tab "Pendientes"
  → ve compañantes con documentos:
     ├─ Link a certificado penal (PDF)
     └─ Link a certificado delitos sexuales (PDF)
  → click "Aprobar" → companion.verified = true → visible en /explorar
  → click "Rechazar" → companion.verified = false

  → ve clientes con documentos:
     └─ Link a certificado discapacidad (PDF)
  → click "Aprobar" → profile.verified = true
```

## 8. Supervisión

```
Supervisor:
  /supervision → "Invitar cliente"
  → busca usuario existente o introduce email
  → POST /supervision/invite → envía email con token
  → cliente recibe email → click link
  → /supervision/accept?token=X → acepta invitación
  → supervisor ve al cliente en "Mis clientes"

Supervisor crea reserva para cliente:
  → POST /bookings { bookedById: supervisorId, clientId }
  → puede gestionar reservas del cliente
```
