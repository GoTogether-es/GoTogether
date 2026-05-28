---
tags: [docs, index]
created: 2026-05-19
updated: 2026-05-25
---

# Documentación de GoTogether

Bienvenido a la documentación técnica de GoTogether. Esta carpeta contiene toda la información necesaria para entender, mantener y extender el proyecto.

## Navegación rápida

### Arquitectura
- [[architecture/overview]] — Visión general, stack, decisiones técnicas

### Base de datos
- [[database/schema]] — Modelos, relaciones, RLS, Realtime
- [[database/migrations]] — Historial de migraciones aplicadas

### Backend (API NestJS)
- [[backend/modules]] — Los 16 módulos y sus responsabilidades
- [[backend/api-endpoints]] — Lista completa de 49 endpoints REST
- [[backend/auth]] — Sistema de autenticación y autorización
- [[backend/booking-state-machine]] — Máquina de estados de reservas (7 estados, 9 transiciones)
- [[backend/availability]] — Sistema de disponibilidad semanal (grid pintable, timezone, orientativo)
- [[backend/matching]] — Motor de búsqueda, ubicación y score de recomendados
- [[backend/supervision]] — Supervisores, invitaciones, ubicación en tiempo real
- [[backend/notifications]] — Notificaciones in-app con Realtime

### Frontend (Next.js)
- [[frontend/pages]] — Todas las páginas, rutas y su propósito
- [[frontend/components]] — Componentes reutilizables (disponibilidad, chat, notificaciones)
- [[frontend/flows]] — Flujos de usuario principales

### Infraestructura
- [[infrastructure/deployment]] — Vercel, Supabase, despliegue
- [[infrastructure/env-vars]] — Variables de entorno y configuración
- [[infrastructure/local-setup]] — Desarrollo local
- [[troubleshooting]] — Errores comunes y soluciones (build, CORS, Realtime, etc.)

### Proyecto
- [[roadmap]] — Estado actual, fases completadas y pendientes
- [[changelog]] — Registro de cambios por versión (hasta v0.1.0-alpha.33)
- [[testing]] — 287 tests (163 API + 124 Web), infraestructura, convenciones

---

## Guía rápida para nuevos desarrolladores

Si es tu primera vez en el proyecto, lee en este orden:

1. [[architecture/overview]] — para entender el stack y las decisiones
2. [[infrastructure/local-setup]] — para levantar el entorno
3. [[database/schema]] — para entender el modelo de datos
4. [[backend/booking-state-machine]] — para entender el núcleo del negocio
5. [[backend/api-endpoints]] — para conocer los endpoints disponibles
6. [[frontend/flows]] — para entender los flujos de usuario
7. [[testing]] — para saber cómo ejecutar y escribir tests (287 existentes)
8. [[troubleshooting]] — si algo falla al arrancar

## Primeros pasos (guía rápida)

```bash
# 1. Clonar
git clone https://github.com/GoTogether-es/GoTogether.git
cd GoTogether

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Editar .env y .env.local con tus credenciales de Supabase y Resend

# 4. Levantar servicios locales (PostgreSQL + MinIO)
cd infra/docker && docker compose up -d

# 5. Generar Prisma Client
pnpm --filter api prisma:generate

# 6. Arrancar en dev
pnpm dev
# API en http://localhost:4000
# Web en http://localhost:3000

# 7. Ejecutar tests
pnpm test
```

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS, TanStack Query v5, Leaflet |
| Backend | NestJS 10, Prisma ORM 5.x, TypeScript strict |
| Base de datos | PostgreSQL (Supabase) |
| Auth | Supabase Auth (magic link JWT) |
| Storage | Supabase Storage (certificados, avatares) |
| Tiempo real | Supabase Realtime (Postgres Changes) |
| Email | Resend (magic link, transaccionales) |
| Pagos | Stripe (deshabilitado en alpha) |
| Testing | Jest 29.7 (287 tests) |
| Hosting | Vercel (fra1), Supabase free tier |
| Package manager | pnpm 10 |

## Convenciones del proyecto

- **Monorepo** con pnpm workspaces
- **TypeScript estricto** en todo el proyecto
- **NestJS modules** para el backend, con DTOs validados
- **Next.js App Router** para el frontend, con Server Components donde sea posible
- **Prisma** como ORM único, schema en `apps/api/prisma/schema.prisma`
- **Zod** para validación en frontend, **class-validator** en backend
- **Supabase** como proveedor único de auth, base de datos, storage y realtime
- **Tests co-localizados** con `__tests__/` o `*.spec.ts`
