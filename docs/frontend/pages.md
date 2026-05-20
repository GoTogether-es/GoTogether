---
tags: [frontend, nextjs, pages, routes]
---

# Páginas del Frontend

Todas las páginas están bajo `apps/web/src/app/` usando Next.js 14 App Router. Las páginas son mayoritariamente Client Components (`'use client'`).

## Mapa de rutas

```
/                               Homepage
/info                           Cómo funciona (página informativa)
/nosotros                       Quiénes somos
/contacto                       Contactar
/auth/
  login                         Magic link login
  verify                        Callback de Supabase Auth
  redirect                      Ruteo post-login
/onboarding
  /                             Selección de rol
  /register/client              Registro de cliente
  /register/companion           Registro de acompañante
  /supervisor                   Registro de supervisor
/explorar                       Buscar acompañantes
  /[id]                         Detalle de acompañante
/solicitud?companionId=X        Crear solicitud de reserva
/reservas                       Mis reservas (cliente y acompañante)
/panel                          Dashboard de acompañante
/coordinacion
  /                             Redirige a /reservas
  /[bookingId]                  Chat en tiempo real
/perfil?onboarding=true&role=X  Ver/editar perfil
/valoracion
  /                             Redirige a /reservas
  /[bookingId]                  Crear/ver valoración
/supervision                    Gestionar supervisión
  /accept?token=X               Aceptar invitación
/admin                          Panel de administración
/legal/privacy                  Privacidad
/legal/terms                    Términos
```

## Descripción de cada página

### `/` — Homepage
**Archivo:** `page.tsx`
**Auth:** Pública

Landing page con hero, pasos del servicio (5 pasos), CTAs y ejemplo de acompañante.

### `/info` — Cómo funciona
**Archivo:** `info/page.tsx`
**Auth:** Pública

Réplica de la landing page de gotogether.es con secciones:
- Hero: título, subtítulo y CTA
- ¿Qué es GoTogether?: 4 funcionalidades (Acompañamiento cercano, Seguridad verificada, Actividades variadas, Impacto humano)
- Elige tu perfil: 2 tarjetas con bullets (Personas acompañadas, Acompañantes)
- ¿Cómo funciona?: 4 pasos (Te registras, Definimos necesidades, Conectamos perfiles, ¡A disfrutar!)
- Preguntas frecuentes: acordeón FAQ con 12 preguntas en 5 categorías usando [[frontend/components#faqaccordion|FaqAccordion]]
- CTA final con botón "Empezar ahora"

Enlazada desde el footer ("Cómo funciona") y la navegación principal.

### `/nosotros` — Quiénes somos
**Archivo:** `nosotros/page.tsx`
**Auth:** Pública

Página corporativa con visión, misión, valores (empatía, confianza, comunidad, autonomía) e información del equipo.

### `/contacto` — Contactar
**Archivo:** `contacto/page.tsx`
**Auth:** Pública

Página de contacto con email (info@gotogether.es), ubicación y enlaces a info y legal.

### `/auth/login` — Login
**Archivo:** `auth/login/page.tsx`
**Auth:** Pública

Formulario de email para recibir magic link. Usa `requestMagicLink()`.

### `/auth/verify` — Verificación
**Archivo:** `auth/verify/page.tsx`
**Auth:** Pública (callback)

Recibe el token de Supabase del magic link, crea la sesión, redirige a `/auth/redirect`.

### `/auth/redirect` — Ruteo post-login
**Archivo:** `auth/redirect/page.tsx`
**Auth:** Pública

Verifica si el usuario tiene perfil:
- Si tiene → `/perfil`
- Si no → `/onboarding`

### `/onboarding` — Selección de rol
**Archivo:** `onboarding/page.tsx`
**Auth:** Protegida

Indicador de progreso ([[frontend/components#stepindicator|StepIndicator]]) mostrando paso 1/3.
Tres tarjetas interactivas (botones nativos): Cliente, Acompañante, Supervisor.
Redirige a la página de registro correspondiente.

### `/onboarding/register/client` — Registro cliente
**Archivo:** `onboarding/register/client/page.tsx`
**Auth:** Protegida

Indicador de progreso (paso 2/3). Formulario con:
- Nombre, teléfono, bio
- Tipo de discapacidad (select)
- Descripción de discapacidad
- [[frontend/components#fileupload|Subida de documento de discapacidad]]
- Al enviar: `upsertProfile` con `isCompanion: false` → redirige a `/explorar`

### `/onboarding/register/companion` — Registro acompañante
**Archivo:** `onboarding/register/companion/page.tsx`
**Auth:** Protegida

Indicador de progreso (paso 2/3). Formulario con:
- Auto-guardado en `sessionStorage` (restaura al volver)
- Nombre, teléfono, bio
- Especialidades
- [[frontend/components#fileupload|Subida de certificados]] (penales + sexuales)
- Al enviar: limpia auto-guardado, `upsertProfile` con `isCompanion: true` → redirige a `/panel`

### `/onboarding/supervisor` — Registro supervisor
**Archivo:** `onboarding/supervisor/page.tsx`
**Auth:** Protegida

Formulario para buscar usuarios existentes o invitar por email.

### `/explorar` — Buscar acompañantes
**Archivo:** `explorar/page.tsx`
**Auth:** Pública

Grid de tarjetas de acompañantes con:
- Búsqueda por nombre/especialidad (debounced 300ms)
- Filtro por tipo de discapacidad y verificados (checkbox estilizado)
- Contador de resultados ("42 acompañantes encontrados")
- Paginación con scroll-to-top automático (9 por página)
- Usa `useRecommendations()` (React Query) → `GET /matching/recommendations`

### `/explorar/[id]` — Detalle de acompañante
**Archivo:** `explorar/[id]/page.tsx`
**Auth:** Pública

[[frontend/components#breadcrumbs|Breadcrumbs]]: Explorar > Nombre del acompañante.
Perfil completo del acompañante con:
- Avatar, nombre, bio, especialidades
- Rating, años en plataforma, servicios completados
- Ratings recientes
- Botón "Solicitar acompañante" → `/solicitud?companionId=${id}`

### `/solicitud` — Crear solicitud
**Archivo:** `solicitud/page.tsx`
**Auth:** Protegida

Formulario de reserva:
- Tipo de servicio (texto libre)
- Fecha y hora
- Dirección
- Discapacidad (select, opcional)
- Notas
- Si se llega con `?companionId=X`, muestra banner y lo envía a la API
- Al enviar: `createBooking()` + `requestBooking()` → redirige a `/reservas`

### `/reservas` — Mis reservas
**Archivo:** `reservas/page.tsx`
**Auth:** Protegida

Lista de reservas del usuario con:
- Badges de estado coloreados
- Información de la reserva (servicio, fecha, dirección)
- Botones de acción según estado: Chat, Iniciar, Completar, Valorar
- Rol-aware: acompañante ve reservas asignadas, cliente ve sus reservas

### `/panel` — Dashboard de acompañante
**Archivo:** `panel/page.tsx`
**Auth:** Protegida

Dashboard con:
- Banner de estado de verificación
- Stats: pendientes, activas, completadas
- Sección "Solicitudes abiertas": reservas REQUESTED sin compañero → botones Aceptar/Rechazar
- Sección "Mis servicios": reservas asignadas → botones Chat/Iniciar/Completar

### `/coordinacion/[bookingId]` — Chat
**Archivo:** `coordinacion/[bookingId]/page.tsx`
**Auth:** Protegida

[[frontend/components#breadcrumbs|Breadcrumbs]]: Mis Reservas > Servicio.
Chat en tiempo real con:
- Skeleton de carga ([[frontend/components#skeleton|SkeletonChat]]) mientras carga
- Suscripción Supabase Realtime a `postgres_changes` en `ChatMessage`
- Envío directo via `supabase.from('ChatMessage').insert()`
- Panel lateral con detalles de la reserva
- Botón de emergencia (`tel:112`) en la cabecera del chat
- Indicador de conexión (verde/amarillo/rojo)
- Scroll automático en el contenedor del chat
- Recarga de mensajes al cambiar de pestaña (visibilitychange)

### `/perfil` — Perfil
**Archivo:** `perfil/page.tsx`
**Auth:** Protegida

Dos modos:
- **Vista:** tarjetas con avatar, info personal, acompañante, discapacidad, preferencias. Botón lápiz para editar.
- **Edición:** formularios con inputs. Subida de avatar. Guardar/Cancelar.
- **Onboarding** (`?onboarding=true`): arranca en modo edición sin botón cancelar.

### `/valoracion/[bookingId]` — Valorar
**Archivo:** `valoracion/[bookingId]/page.tsx`
**Auth:** Protegida

Formulario de valoración:
- Estrellas (1-5)
- Comentario opcional
- Muestra valoración existente si ya se creó
- Solo disponible para reservas COMPLETED

### `/supervision` — Supervisión
**Archivo:** `supervision/page.tsx`
**Auth:** Protegida

Gestión de supervisión:
- Ver clientes supervisados
- Ver mi supervisor
- Invitar nuevos clientes
- Gestionar invitaciones pendientes

### `/admin` — Administración
**Archivo:** `admin/page.tsx`
**Auth:** Propia (password gate)

Panel con 8 pestañas:
- **Dashboard**: stats ampliados (usuarios, reservas, pagos, facturación, pendientes)
- **Usuarios**: tabla con nombre, email, rol, verificado y fecha de registro
- **Pendientes**: aprobar/rechazar acompañantes y clientes con links a documentos
- **Reservas**: tabla paginada con filtro por estado, detalle con chat y pagos
- **Servicios**: CRUD del catálogo (crear, editar, activar/desactivar)
- **Pagos**: historial paginado con importe, comisión y estado
- **Valoraciones**: listado paginado con opción de eliminar
- **Notificaciones**: envío masivo por rol (todos, clientes, acompañantes)
