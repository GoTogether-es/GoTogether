---
tags: [docs, index]
created: 2026-05-19
updated: 2026-05-19
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
- [[backend/modules]] — Los 15 módulos y sus responsabilidades
- [[backend/api-endpoints]] — Lista completa de endpoints REST
- [[backend/auth]] — Sistema de autenticación y autorización

### Frontend (Next.js)
- [[frontend/pages]] — Todas las páginas, rutas y su propósito
- [[frontend/components]] — Componentes reutilizables
- [[frontend/flows]] — Flujos de usuario principales

### Infraestructura
- [[infrastructure/deployment]] — Vercel, Supabase, despliegue
- [[infrastructure/env-vars]] — Variables de entorno y configuración
- [[infrastructure/local-setup]] — Desarrollo local

### Proyecto
- [[roadmap]] — Estado actual, fases completadas y pendientes
- [[changelog]] — Registro de cambios por versión

---

## Guía rápida para nuevos desarrolladores

Si es tu primera vez en el proyecto, lee en este orden:

1. [[architecture/overview]] — para entender el stack y las decisiones
2. [[infrastructure/local-setup]] — para levantar el entorno
3. [[database/schema]] — para entender el modelo de datos
4. [[backend/api-endpoints]] — para conocer los endpoints disponibles
5. [[frontend/flows]] — para entender los flujos de usuario
6. [[roadmap]] — para saber qué está hecho y qué falta

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend | NestJS 10, Prisma ORM, TypeScript |
| Base de datos | PostgreSQL (Supabase) |
| Auth | Supabase Auth (magic link) |
| Storage | Supabase Storage |
| Tiempo real | Supabase Realtime (Postgres Changes) |
| Email | Resend |
| Pagos | Stripe (deshabilitado en alpha) |
| Hosting | Vercel (web + api serverless) |

## Convenciones del proyecto

- **Monorepo** con pnpm workspaces
- **TypeScript estricto** en todo el proyecto
- **NestJS modules** para el backend, con DTOs validados
- **Next.js App Router** para el frontend, con Server Components donde sea posible
- **Prisma** como ORM único, schema en `apps/api/prisma/schema.prisma`
- **Zod** para validación en frontend, **class-validator** en backend
- **Supabase** como proveedor único de auth, base de datos, storage y realtime
