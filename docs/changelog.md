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
