---
tags: [infrastructure, env, configuration]
---

# Variables de entorno

## Archivos de configuración

| Archivo | Entorno | Propósito |
|---------|---------|-----------|
| `.env.example` | Documentación | Valores de ejemplo para nuevos desarrolladores |
| `apps/api/.env` | Desarrollo local | Variables reales para el backend en local |
| Vercel dashboard (web) | Producción | Variables para el frontend (prefijo `NEXT_PUBLIC_`) |
| Vercel dashboard (api) | Producción | Variables para el backend |

## Lista completa

### Supabase

| Variable | Dónde | Descripción |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel web, local `.env` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Vercel web | Key publicable moderna de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel web (fallback) | Key anónima legacy de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel api, local | Key de servicio para operaciones admin |
| `SUPABASE_JWT_SECRET` | Vercel api, local | Secreto para validar JWT de Supabase |
| `DATABASE_URL` | Vercel api, local | Conexión PostgreSQL (Supabase) |

### Aplicación

| Variable | Dónde | Descripción |
|----------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | Vercel web | URL del frontend |
| `NEXT_PUBLIC_API_URL` | Vercel web | URL del backend |
| `ADMIN_PASSWORD` | Vercel api, local | Contraseña del panel /admin |

### Stripe (deshabilitado en alpha)

| Variable | Dónde | Descripción |
|----------|-------|-------------|
| `STRIPE_SECRET_KEY` | Vercel api | Clave secreta de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Vercel api | Secreto para verificar webhooks |
| `STRIPE_PLATFORM_FEE_PERCENT` | Vercel api | Comisión de plataforma (12%) |

> [!warning] `STRIPE_PLATFORM_FEE_PERCENT` está configurado pero **no se usa en el código**. La comisión está hardcodeada en `bookings.service.ts` (eliminada al deshabilitar pagos).

### Email (Resend)

| Variable | Dónde | Descripción |
|----------|-------|-------------|
| `RESEND_API_KEY` | Vercel api, local | API key de Resend |
| `RESEND_FROM` | Vercel api, local | Dirección "from" de los emails |

## Variables con prefijo `NEXT_PUBLIC_`

Estas variables se exponen al navegador. Solo deben contener valores públicos (URLs, keys publicables). **Nunca** poner secretos aquí.

- `NEXT_PUBLIC_SUPABASE_URL` — visible en el frontend
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — visible, es una key pública
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — visible, es una key anónima
- `NEXT_PUBLIC_APP_URL` — visible
- `NEXT_PUBLIC_API_URL` — visible

## Configuración en Vercel

Las variables se configuran en el dashboard de Vercel por proyecto:

1. Ir a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Seleccionar el proyecto (web o api)
3. Settings → Environment Variables
4. Añadir cada variable con su valor
5. Los deployments automáticos recogen las variables nuevas

### Diferencia entre web y api

- **Web:** solo necesita `NEXT_PUBLIC_*` (las keys públicas de Supabase y URLs)
- **API:** necesita todas las demás (DATABASE_URL, SERVICE_ROLE_KEY, JWT_SECRET, ADMIN_PASSWORD, RESEND, STRIPE)

## Variables locales (desarrollo)

El archivo `apps/api/.env` contiene valores reales para desarrollo local. **No se commitea al repositorio** (está en `.gitignore`).

Para desarrollo local:
1. Copia `.env.example` a `apps/api/.env`
2. Rellena con valores reales (pueden ser los mismos de producción para Supabase, o usar un proyecto Supabase local)

El comando `pnpm dev` carga automáticamente las variables de `apps/api/.env` y `apps/web/.env.local` (según configuración de cada framework).
