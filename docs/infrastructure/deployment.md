---
tags: [infrastructure, deployment, vercel, supabase]
---

# Despliegue

## Proveedores

| Servicio | Proveedor | Plan | URL |
|----------|-----------|------|-----|
| Frontend (Next.js) | Vercel | Hobby | `your-frontend.vercel.app` |
| Backend (NestJS) | Vercel | Hobby | `your-api.vercel.app` |
| Base de datos | Supabase | Free | `<your-project>.supabase.co` |
| Auth | Supabase Auth | Free | (mismo proyecto) |
| Storage | Supabase Storage | Free | (mismo proyecto) |
| Email | Resend | Free | `info@gotogether.es` |

## Vercel — Frontend (Next.js)

### Configuración del proyecto
- **Framework:** Next.js
- **Root directory:** `apps/web`
- **Build command:** `pnpm install --frozen-lockfile && pnpm build`
- **Output directory:** `.next`
- **Install command:** `pnpm install --frozen-lockfile`

### Variables de entorno necesarias
```
NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
NEXT_PUBLIC_API_URL=https://your-api.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...  (fallback)
```

### Despliegue automático
- Rama `main` → producción
- Otras ramas → preview deployments

## Vercel — Backend (NestJS)

### Configuración del proyecto
- **Framework:** Other
- **Root directory:** `apps/api`
- **Build command:** `pnpm install --frozen-lockfile && cd ../.. && pnpm build`
- **Output directory:** `apps/api`
- **Serverless function entry:** `apps/api/api/index.ts`

### Variables de entorno necesarias
```
DATABASE_URL=postgresql://postgres.xxx:xxx@your-db.supabase.com:6543/postgres
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_JWT_SECRET=...
ADMIN_PASSWORD=admin
RESEND_API_KEY=re_...
RESEND_FROM=GoTogether <info@example.com>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Limitaciones de Vercel serverless
- **Timeout:** 15 segundos (Hobby), 60 segundos (Pro)
- **Sin WebSockets:** el chat usa Supabase Realtime en vez de Socket.IO
- **Sin estado:** no hay memoria compartida entre invocaciones
- **Tamaño de payload:** 4.5 MB (body)

> [!warning] Para producción con WebSockets nativos, migrar la API a Fly.io, Railway o Render. Ver [[roadmap]] para detalles.

## Supabase

### Proyecto
- **ID:** `<your-project-id>`
- **Región:** `eu-west-1`
- **Plan:** Free (500 MB DB, 1 GB Storage, 200 Realtime concurrentes)

### Configuración de Auth
- **Provider:** Magic Link (email)
- **Site URL:** `https://your-frontend.vercel.app`
- **Redirect URLs:** `https://your-frontend.vercel.app/auth/verify`

### Storage buckets
- `certificates` — público, 10 MB, PDF/PNG/JPG
- `avatars` — público, 5 MB, PNG/JPEG/WebP

### Realtime
- Tablas con replicación: `ChatMessage`, `Notification`

## Resend (email)

- **API Key:** en Vercel env vars
- **From:** `GoTogether <info@gotogether.es>`
- **Dominio verificado:** `gotogether.es`

### Emails enviados
1. **Magic link** — autenticación sin contraseña
2. **Invitación de supervisión** — email con token para aceptar

## CI/CD

El despliegue es automático desde GitHub:
- Push a `main` → Vercel despliega ambos proyectos
- No hay tests automáticos en CI
- No hay staging environment separado

## Estructura de archivos de deploy

```
apps/api/
├── api/
│   └── index.ts          # Entry point Vercel serverless
├── vercel.json            # Configuración Vercel
└── package.json

apps/web/
├── next.config.mjs        # Configuración Next.js
├── vercel.json            # Configuración Vercel (si existe)
└── src/middleware.ts      # Middleware de autenticación
```
