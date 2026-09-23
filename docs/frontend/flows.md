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
      ├─ **Dirección completa (autocompletar obligatorio)**
       │   └─ Escribe → elige de sugerencias reales (Nominatim)
       │       → rellena ciudad + lat/lon + addressVerified
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
       ├─ **Dirección completa (autocompletar obligatorio)**
       │   └─ Escribe → elige de sugerencias reales (Nominatim)
       │       → rellena ciudad + lat/lon + addressVerified
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

### Ubicación y recomendados

```
/perfil y onboarding
  → usuario elige dirección real del autocompletar (Nominatim)
  → backend guarda Profile.city + UserLocation.fullAddress + lat/lon
  → geocodificación gratuita con Nominatim (validada al elegir)
  → latitude/longitude se guardan en UserLocation

/explorar
  → usa coords del cliente para ordenar por score compuesto
     ├─ distancia (anillos: misma ciudad ≤ 25 km resto)
     ├─ rating
     ├─ verificación
     ├─ ciudad
     └─ experiencia
  → si no hay coordenadas, usa city como fallback
```

## 4. Valoración tras reserva completada

```
 /reservas/:bookingId (tras COMPLETED)
   → /valoracion/:bookingId
      ├─ Rating 1-5 estrellas
      ├─ Resumen opcional
      └─ submit → POST /reports
  → actualiza rating medio del acompañante
  → notifica al acompañante
```

## 5. Panel de acompañante

```
/panel
  ├─ Servicios: CRUD de servicios propios
  ├─ Disponibilidad: grid semanal (horas disponibles)
  ├─ Solicitudes: lista de reservas REQUESTED → ACCEPT/DECLINE
  ├─ Historial: reservas COMPLETED + valoraciones
  └─ Perfil: editar especialidades, disponibilidad, datos personales
```

## 6. Panel de administración

```
/admin
  ├─ Stats: usuarios, reservas, acompañantes, ingresos
  ├─ Usuarios: listado, búsqueda, edición de rol
  ├─ Acompañantes: verificación de documentos (penal/sexual)
  ├─ Reservas: listado, estados, cancelaciones
  └─ Pagos: Stripe (deshabilitado en alpha)
```