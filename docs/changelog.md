---
tags: [project, changelog, history]
---

# Changelog

## v0.1.0-alpha — Mayo 2026

### Core
- ✅ Monorepo con pnpm workspaces (apps/web, apps/api, packages/ui, packages/shared)
- ✅ Next.js 14 App Router con Server Components
- ✅ NestJS 10 con módulos organizados
- ✅ Supabase Auth con magic link vía Resend
- ✅ Supabase Storage para certificados y avatares
- ✅ Supabase Realtime para chat y notificaciones
- ✅ Prisma ORM con 11 modelos

### Onboarding y perfiles
- ✅ Registro de cliente con documento de discapacidad
- ✅ Registro de acompañante con certificados penales y sexuales
- ✅ Registro de supervisor con invitaciones
- ✅ Perfil con modo vista/edición y avatar

### Marketplace
- ✅ Búsqueda de acompañantes con filtros y paginación
- ✅ Detalle de acompañante con ratings y estadísticas
- ✅ Solicitud de reserva con asignación de companionId
- ✅ Panel de acompañante con solicitudes abiertas
- ✅ Máquina de estados de booking (DRAFT → REQUESTED → ACCEPTED → IN_PROGRESS → COMPLETED)
- ✅ Listado de acompañantes filtrado por verificación

### Chat
- ✅ Chat en tiempo real vía Supabase Realtime (Postgres Changes)
- ✅ Envío directo de mensajes con RLS
- ✅ Historial de mensajes por sala
- ✅ Scroll automático en contenedor del chat
- ✅ Indicador visual de mensajes propios vs ajenos

### Notificaciones
- ✅ Tabla Notification con RLS + Realtime
- ✅ Campanita con badge en navbar
- ✅ Dropdown de notificaciones con marcar leídas
- ✅ Triggers automáticos: solicitudes, aceptación, rechazo, completado, cancelado, valoración

### Admin
- ✅ Panel con password gate (x-admin-key)
- ✅ Dashboard con estadísticas
- ✅ Tabla de usuarios
- ✅ Verificación de acompañantes (aprobar/rechazar)
- ✅ Verificación de clientes (aprobar/rechazar)

### Seguridad
- ✅ RLS en ChatMessage y Notification
- ✅ CSP headers en Next.js
- ✅ Rate limiting global (ThrottlerGuard)
- ✅ Validación de datos (Zod frontend, class-validator backend)
- ✅ Autenticación JWT con JWKS de Supabase

### Legal
- ✅ Página de privacidad
- ✅ Página de términos
- ✅ Footer con enlaces legales

---

## v0.1.1-alpha — Mayo 2026

### Estabilización
- ✅ `SupabaseJwtStrategy.validate()` consulta BD para incluir `role` en `req.user`
- ✅ `RolesAuthGuard` + `@Roles()` aplicado en endpoints de supervisor
- ✅ `MailService` centralizado compartido entre módulos
- ✅ Emails transaccionales en cambios de estado de reserva (aceptada, rechazada, completada, cancelada)
- ✅ Emails transaccionales en verificación de documentos (aprobada, rechazada)
- ✅ Indicador de estado de conexión en chat (conectado/reconectando/sin conexión)
- ✅ Refetch automático de mensajes al recuperar visibilidad de la pestaña
- ✅ Limpieza de Redis no usado (eliminado de .env, .env.example y docker-compose.yml)

## v0.2.0-alpha — Mayo 2026

### Funcionalidades avanzadas
- ✅ Catálogo de servicios: modelo `Service` con nombre, descripción, precio y categoría + seed data + endpoint público
- ✅ Dropdown de servicios en `/solicitud` reemplazando input de texto libre, con precio orientativo visible
- ✅ Disponibilidad semanal para acompañantes: modelo `AvailabilitySlot` + API `PUT /availability` + editor en `/panel`
- ✅ Validación de disponibilidad al crear reserva (rechaza si companion no tiene el slot disponible)
- ✅ Historial de servicios: `GET /bookings/history` con paginación y `GET /bookings/stats` con agregados
- ✅ Página `/historial` con estadísticas (total, valoración media, valoraciones recibidas) y lista paginada
- ✅ `BookingData` ampliado con `serviceId` y `service` relation
- ✅ `CompanionProfileData` ampliado con `id` para acceso directo

---

## Próximas versiones

### v0.2.0-beta — Pagos
- Stripe integrado en el flujo de reservas
- Webhooks de Stripe funcionales
- UI de pago en el frontend

### v0.3.0 — Funcionalidades
- Catálogo de servicios con precios
- Calendario de disponibilidad
- Emails transaccionales completos
- Roles y permisos aplicados

### v1.0.0 — Producción
- API migrada a plataforma con WebSockets
- Tests automatizados
- CI/CD completo
- GDPR compliance

## v0.1.0-alpha.28 — Mayo 2026 (UI/UX fixes)

### UI
- 🎨 Notificaciones: emojis reemplazados por íconos Lucide con colores semánticos
- 📊 StepIndicator: indicador de progreso en onboarding (3 pasos con checkmarks)
- 💀 SkeletonChat: placeholder de chat durante carga (antes era texto "Cargando...")
- ☑️ Checkbox y select nativos estilizados (appearance: none, SVG inline)
- 🌙 Dark mode: CSS custom properties + Tailwind `darkMode: 'class'`, variantes para cards, inputs, tags, checkboxes, hero
- 🔴 Botón "Llamar" en chat reemplazado por link funcional `tel:112` (Emergencia)

### UX
- ⚠️ ConfirmDialog: modal de confirmación para acciones destructivas (logout)
- 🧭 Breadcrumbs: migas de pan en rutas profundas (Explorar > Nombre | Mis Reservas > Servicio)
- ♿ RouteAnnouncer: anunciador de cambios de página para lectores de pantalla
- 💾 Auto-guardado: formulario de registro de acompañante guarda en sessionStorage
- 🔼 Scroll-to-top automático al paginar en explorar
- 📊 Contador de resultados en búsqueda ("42 acompañantes encontrados")
- 🖱️ Botones nativos en onboarding (antes div[role=button])
- 📝 27 tildes/acentos corregidos en textos en español

### Tests
- ✅ schemas.test.ts: corregido (serviceType → serviceId)
- ✅ solicitud.test.tsx: corregido (añadido QueryClientProvider)
- 🔧 app-shell.test.tsx: mock de sub-componentes (pre-existente ESM issue)
- 📄 Nueva página `/info` réplica de landing page gotogether.es (hero, features, perfiles, 4 pasos, FAQ acordeón, CTA) — enlazada desde footer y navbar
- 🎨 Nuevo componente `FaqAccordion` con animación de apertura/cierre
