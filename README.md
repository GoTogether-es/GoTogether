# GoTogether

Plataforma digital que conecta personas mayores y personas con discapacidad (**clientes**) con acompañantes verificados (**acompañantes**) para actividades cotidianas.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend | NestJS 10, Prisma ORM, TypeScript |
| Base de datos | PostgreSQL (Supabase) |
| Auth | Supabase Auth (magic link) |
| Storage | Supabase Storage (certificados, avatares) |
| Tiempo real | Supabase Realtime (chat, notificaciones) |
| Email | Resend |
| Hosting | Vercel (serverless) |

## Estructura del monorepo

```
GoTogether/
├── apps/
│   ├── api/          # NestJS backend (13 módulos)
│   └── web/          # Next.js frontend (20+ páginas)
├── packages/
│   ├── shared/       # Tipos compartidos (@gotogether/shared)
│   └── ui/           # Componentes UI (@gotogether/ui)
├── infra/docker/     # Servicios locales (postgres, redis, minio)
└── docs/             # Documentación completa del proyecto
```

## Inicio rápido

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
cp .env.example apps/api/.env
# Editar apps/api/.env con valores reales

# 3. Generar Prisma Client
cd apps/api && npx prisma generate && cd ../..

# 4. Iniciar desarrollo (web + api en paralelo)
pnpm dev
```

## Documentación

Toda la documentación técnica está en la carpeta [`docs/`](docs/). Está formateada para verse con [Obsidian](https://obsidian.md).

- [[docs/README|Índice de documentación]]
- [[docs/architecture/overview|Arquitectura general]]
- [[docs/database/schema|Esquema de base de datos]]
- [[docs/backend/api-endpoints|API Endpoints]]
- [[docs/frontend/flows|Flujos de usuario]]
- [[docs/infrastructure/deployment|Despliegue]]
- [[docs/roadmap|Roadmap y estado actual]]

## Despliegue

El proyecto se despliega automáticamente en Vercel al hacer push a `main`. Consulta [[docs/infrastructure/deployment]] para más detalles.

## Licencia

Propietaria. Todos los derechos reservados.
