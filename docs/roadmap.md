---
tags: [project, roadmap, planning]
---

# Roadmap

## Estado actual: Alpha (v0.1.0)

El núcleo del marketplace está funcional: los usuarios pueden registrarse, buscar acompañantes, crear reservas, chatear en tiempo real y valorar servicios. Los pagos están deshabilitados — el servicio es gratuito durante la alpha.

---

## ✅ Fase 1 — Pulido (completada)

- [x] Links del footer apuntan a páginas legales reales
- [x] Búsqueda de usuarios funcional en supervisión
- [x] Banner de estado de verificación en `/panel`
- [x] Badge de verificación en `/perfil` modo vista
- [x] Ruta `/admin` en `routes.ts`

## ✅ Fase 2 — Notificaciones (completada)

- [x] Tabla `Notification` con RLS + Realtime
- [x] Notificaciones in-app: campanita con badge y dropdown
- [x] Triggers automáticos en bookings (accept, decline, complete, cancel) + reports (rating)
- [x] API endpoints: list, unread-count, mark-read, mark-all-read

## ✅ Fase 3 — Estabilización (bugs) (completada)

- [x] `@Roles()` y `RolesAuthGuard` funcionales: `SupabaseJwtStrategy.validate()` consulta BD para incluir `role` en `req.user`
- [x] `RolesAuthGuard` aplicado en endpoints de supervisor
- [x] Redis eliminado de `.env` y Docker Compose
- [x] Emails transaccionales: aceptación, rechazo, completado, cancelación de reserva + verificación aprobada/rechazada
- [x] Manejo de reconexión en chat: indicador de estado (conectado/reconectando/sin conexión) + refetch al recuperar visibilidad

## ⬜ Fase 4 — Pagos

- [ ] Configurar `STRIPE_SECRET_KEY` real en Vercel
- [ ] Integrar PaymentsService en BookingsService
- [ ] Crear PaymentIntent al aceptar reserva
- [ ] Capturar pago al completar servicio
- [ ] Liberar retención al cancelar
- [ ] Procesar webhooks de Stripe para sincronización
- [ ] Aplicar `STRIPE_PLATFORM_FEE_PERCENT` (12%)
- [ ] UI de pago en el frontend (Stripe Elements o Checkout)

## ✅ Fase 5 — Funcionalidades avanzadas (completada)

- [x] Catálogo de servicios con precios: modelo `Service` + seed data + endpoint `GET /services` + dropdown en `/solicitud`
- [x] Disponibilidad semanal para acompañantes: modelo `AvailabilitySlot` + endpoint `PUT /availability` + UI en `/panel`
- [x] Validación de disponibilidad al crear reserva con companionId
- [x] Historial de servicios completados: `GET /bookings/history` + `GET /bookings/stats` + página `/historial` con paginación
- [x] Roles en supervisor: chequeo manual `requireSupervisorRole()` en `SupervisionService`
- [x] Roles en admin: documentado como `AdminGuard` por header `x-admin-key` (simplificación alpha)

## ⬜ Fase 6 — GDPR y cumplimiento

- [ ] Eliminación de cuenta (derecho al olvido)
- [ ] Exportación de datos (portabilidad)
- [ ] Banner de cookies
- [ ] Política de privacidad detallada

## ⬜ Fase 6 — Producción

- [ ] Migrar API de Vercel serverless a Fly.io / Railway (WebSocket nativo)
- [ ] Restaurar Socket.IO para chat si se requiere mayor escala
- [ ] Plan Pro de Supabase (más almacenamiento, backups, sin pausa)
- [ ] Tests automatizados (Jest para backend, Testing Library para frontend)
- [ ] CI/CD con tests pre-merge
- [ ] Monitorización y alertas (Sentry, Vercel Analytics)
- [ ] Plan de Disaster Recovery (backups de BD, rollback)

---

## Bugs conocidos

1. **`@Roles()` y `RolesAuthGuard` no funcionales** — ~~`req.user.role` es undefined porque `SupabaseJwtStrategy.validate()` no incluye el rol.~~ ✅ Corregido: la estrategia ahora consulta la BD y el guard se aplica en endpoints de supervisor.
2. **Redis configurado pero no usado** — ~~`REDIS_URL` existe en `.env` y Docker pero ningún servicio lo utiliza.~~ ✅ Corregido: eliminado de `.env`, `.env.example` y `docker-compose.yml`.
3. **Webhook de Stripe no procesa eventos** — El endpoint recibe y verifica la firma pero descarta el evento.
4. **Emails transaccionales limitados** — ~~Solo magic link e invitación de supervisión.~~ ✅ Corregido: ahora se envían emails en cambios de estado de reserva y verificación de documentos.
5. **`STRIPE_PLATFORM_FEE_PERCENT` no se usa** — La variable está en `.env` pero no se lee en el código.
6. **No hay reconexión automática en el chat** — ~~Si la conexión Realtime se cae, el chat deja de recibir mensajes hasta recargar.~~ ✅ Corregido: indicador visual de estado de conexión + refetch de mensajes al recuperar visibilidad de la pestaña.

---

## Límites del plan gratuito actual

| Recurso | Límite | Estimación actual | ¿Preocupante? |
|---------|--------|-------------------|---------------|
| Supabase DB | 500 MB | < 10 MB | No |
| Supabase Storage | 1 GB | < 5 MB | No |
| Supabase Auth usuarios | Ilimitado | < 100 | No |
| Realtime concurrentes | 200 | < 10 | No |
| Realtime mensajes/mes | 2M | < 10K | No |
| Vercel serverless (Hobby) | 100 GB-horas | < 1 GB-hora | No |
| Vercel bandwidth | 100 GB | < 1 GB | No |
| Resend emails/día | 100 | < 10 | No |

> [!note] Ningún límite está cerca de alcanzarse en alpha. Para beta con usuarios reales, el primer límite en saltar será probablemente Vercel serverless o Realtime concurrentes.
