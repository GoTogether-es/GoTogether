---
tags: [project, roadmap, planning]
---

# Roadmap

## Estado actual: Alpha (v0.1.0)

El núcleo del marketplace está funcional: los usuarios pueden registrarse, buscar acompañantes, crear reservas, chatear en tiempo real y valorar servicios. Los pagos están deshabilitados — el servicio es gratuito durante la alpha. El panel de administración está completo con 8 pestañas funcionales. La landing page está replicada en `/info`.

---

## ✅ Fase 1 — Pulido (completada)

- [x] Links del footer apuntan a páginas legales reales
- [x] Búsqueda de usuarios funcional en supervisión
- [x] Banner de estado de verificación en `/panel`
- [x] Badge de verificación en `/perfil` modo vista
- [x] Ruta `/admin` en `routes.ts`
- [x] Footer actualizado (Quiénes somos, Cómo funciona, Contactar)
- [x] Páginas `/nosotros`, `/contacto`, `/info`
- [x] Enlaces de homepage e info con detección de sesión (login vs perfil)
- [x] Navegación con "Cómo funciona" e "Historial"

## ✅ Fase 2 — Notificaciones (completada)

- [x] Tabla `Notification` con RLS + Realtime
- [x] Notificaciones in-app: campanita con badge y dropdown
- [x] Triggers automáticos en bookings (accept, decline, complete, cancel) + reports (rating)
- [x] API endpoints: list, unread-count, mark-read, mark-all-read

## ✅ Fase 3 — Estabilización (bugs) (completada)

- [x] `@Roles()` y `RolesAuthGuard` funcionales
- [x] `RolesAuthGuard` aplicado en endpoints de supervisor
- [x] Redis eliminado de `.env` y Docker Compose
- [x] Emails transaccionales
- [x] Manejo de reconexión en chat

## ⬜ Fase 4 — Pagos (prioridad alta)

- [ ] Configurar `STRIPE_SECRET_KEY` real en Vercel
- [ ] Integrar PaymentsService en BookingsService
- [ ] Crear PaymentIntent al aceptar reserva
- [ ] Capturar pago al completar servicio
- [ ] Liberar retención al cancelar
- [ ] Procesar webhooks de Stripe para sincronización
- [ ] Aplicar `STRIPE_PLATFORM_FEE_PERCENT` (12%)
- [ ] UI de pago en el frontend (Stripe Elements o Checkout)

## ✅ Fase 5 — Funcionalidades avanzadas + Admin + Supervisión (completada)

- [x] Catálogo de servicios con precios
- [x] Disponibilidad semanal para acompañantes
- [x] Historial de servicios
- [x] Admin ampliado (8 pestañas)
- [x] Supervisión: pestaña reservas de clientes + ubicación en tiempo real (Leaflet)
- [x] Flujo de finalización: acompañante solicita → cliente confirma → valoración
- [x] Toggle compartir ubicación en perfil

## ⬜ Fase 6 — GDPR y cumplimiento (prioridad media)

- [ ] Eliminación de cuenta (derecho al olvido)
- [ ] Exportación de datos (portabilidad)
- [ ] Banner de cookies
- [ ] Política de privacidad detallada

## ⬜ Fase 7 — Producción (prioridad media-baja)

- [ ] Migrar API de Vercel serverless a Fly.io / Railway (WebSocket nativo)
- [ ] Restaurar Socket.IO para chat si se requiere mayor escala
- [ ] Plan Pro de Supabase (más almacenamiento, backups, sin pausa)
- [ ] Tests automatizados (Jest para backend, Testing Library para frontend)
- [ ] CI/CD con tests pre-merge
- [ ] Monitorización y alertas (Sentry, Vercel Analytics)
- [ ] Plan de Disaster Recovery (backups de BD, rollback)

## 🆕 Fase 8 — SEO y métricas

- [x] Metadata + Open Graph en todas las páginas
- [x] Sitemap.xml y robots.txt
- [ ] Analytics (Plausible): el componente `Analytics` ya está creado en `components/analytics.tsx`. Para activarlo, importarlo en `layout.tsx` y definir `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=gotogether.es`
- [x] Página 404 personalizada con metadata
- [ ] OG image real (actualmente referenciada pero no generada)

## 🆕 Fase 9 — UX y conversión (prioridad baja)

- [ ] Onboarding guiado paso a paso con tooltips
- [ ] Emails de bienvenida y reenganche
- [ ] Página de precios pública
- [ ] Blog / recursos
- [ ] Programa de referidos

---

## Bugs conocidos

1. **`@Roles()` y `RolesAuthGuard` no funcionales** — ~~`req.user.role` es undefined.~~ ✅ Corregido.
2. **Redis configurado pero no usado** — ✅ Corregido: eliminado.
3. **Webhook de Stripe no procesa eventos** — El endpoint recibe y verifica la firma pero descarta el evento.
4. **`STRIPE_PLATFORM_FEE_PERCENT` no se usa** — La variable está en `.env` pero no se lee en el código.
5. **Emails transaccionales limitados** — ✅ Corregido.
6. **No hay reconexión automática en el chat** — ✅ Corregido.
7. **Tests rotos (pre-existente)** — Varios tests fallan por `@testing-library/jest-dom` no tipado y mocks ESM.

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
