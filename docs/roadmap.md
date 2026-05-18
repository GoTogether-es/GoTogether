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

## ⬜ Fase 3 — Pagos

- [ ] Configurar `STRIPE_SECRET_KEY` real en Vercel
- [ ] Integrar PaymentsService en BookingsService
- [ ] Crear PaymentIntent al aceptar reserva
- [ ] Capturar pago al completar servicio
- [ ] Liberar retención al cancelar
- [ ] Procesar webhooks de Stripe para sincronización
- [ ] Aplicar `STRIPE_PLATFORM_FEE_PERCENT` (12%)
- [ ] UI de pago en el frontend (Stripe Elements o Checkout)

## ⬜ Fase 4 — Funcionalidades avanzadas

- [ ] Catálogo de servicios con precios (reemplazar `serviceType` free-text)
- [ ] Disponibilidad / calendario para acompañantes
- [ ] Aplicar `@Roles()` y `RolesAuthGuard` en endpoints de admin y supervisor
- [ ] Historial de servicios completados con estadísticas

## ⬜ Fase 5 — GDPR y cumplimiento

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

1. **`@Roles()` y `RolesAuthGuard` no funcionales** — `req.user.role` es undefined porque `SupabaseJwtStrategy.validate()` no incluye el rol. Requiere consulta a BD en la estrategia.
2. **Redis configurado pero no usado** — `REDIS_URL` existe en `.env` y Docker pero ningún servicio lo utiliza.
3. **Webhook de Stripe no procesa eventos** — El endpoint recibe y verifica la firma pero descarta el evento.
4. **Emails transaccionales limitados** — Solo magic link e invitación de supervisión. Faltan: confirmación de reserva, cambio de estado, verificación aprobada.
5. **`STRIPE_PLATFORM_FEE_PERCENT` no se usa** — La variable está en `.env` pero no se lee en el código.
6. **No hay reconexión automática en el chat** — Si la conexión Realtime se cae, el chat deja de recibir mensajes hasta recargar. Supabase JS maneja reconexión básica pero no se verifica en el frontend.

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
