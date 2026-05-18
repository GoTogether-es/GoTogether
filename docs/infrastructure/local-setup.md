---
tags: [infrastructure, development, local, setup]
---

# Desarrollo local

## Requisitos

- **Node.js** ≥ 20
- **pnpm** ≥ 10 (`npm install -g pnpm`)
- **Docker** (opcional, para servicios locales)
- **Cuenta Supabase** (proyecto cloud o local)

## Primeros pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/GoTogether-es/GoTogether.git
cd GoTogether

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
cp .env.example apps/api/.env
# Editar apps/api/.env con valores reales

# 4. Generar Prisma Client
cd apps/api && npx prisma generate && cd ../..

# 5. Iniciar desarrollo
pnpm dev
```

## Servicios con Docker

```bash
cd infra/docker
docker compose up -d
```

Esto levanta:
- **PostgreSQL 16** en `localhost:5432` (DB: `gotogether`, user/pass: `postgres/postgres`)
- **Redis 7** en `localhost:6379`
- **MinIO** (S3-compatible) en `localhost:9000` (consola en `localhost:9001`, user/pass: `minio/minio123`)

> [!note] Para desarrollo, es más sencillo usar el proyecto Supabase cloud directamente. Los servicios Docker son para cuando necesitas desarrollo offline o pruebas de integración.

## Estructura de comandos

```bash
pnpm dev              # Inicia web (puerto 3000) + api (puerto 4000) en paralelo
pnpm build            # Compila todos los paquetes
pnpm lint             # Ejecuta linter en todos los paquetes
pnpm test             # Ejecuta tests en todos los paquetes
```

### Comandos individuales

```bash
# Solo frontend
cd apps/web && pnpm dev

# Solo backend
cd apps/api && pnpm dev

# Prisma
cd apps/api && npx prisma generate    # Regenerar cliente tras cambiar schema
cd apps/api && npx prisma studio      # Interfaz web para explorar BD
```

## Configuración de Supabase para desarrollo

Puedes usar el mismo proyecto Supabase de producción para desarrollo, o crear uno separado.

### Opción A: Compartir proyecto con producción (recomendado para alpha)

Usa las mismas credenciales de Supabase en `apps/api/.env` que en Vercel. Ventajas: no duplicar configuración, datos reales. Desventajas: cuidado con modificar datos de producción.

### Opción B: Proyecto Supabase separado

1. Crea un nuevo proyecto en [supabase.com](https://supabase.com)
2. Copia las credenciales a `apps/api/.env`
3. Aplica las migraciones manualmente (ejecuta el SQL de [[database/migrations]])
4. Crea los buckets de Storage manualmente

## Flujo de desarrollo típico

1. `pnpm dev` → frontend en `localhost:3000`, backend en `localhost:4000`
2. Hacer cambios en el código
3. El backend se reinicia automáticamente (NestJS watch mode)
4. El frontend se recarga con HMR (Next.js Fast Refresh)
5. Probar en el navegador

### Si cambias el schema de Prisma

```bash
cd apps/api
npx prisma generate          # Regenerar cliente TypeScript
# Si necesitas migrar la BD:
# Opción 1: Usar supabase_apply_migration (igual que en producción)
# Opción 2: npx prisma db push (solo desarrollo, menos seguro)
```

## Debugging

### Logs del backend
Los logs de NestJS aparecen en la terminal donde ejecutas `pnpm dev`.

### Logs de Supabase
- Dashboard → Logs → API / Storage / Postgres

### Logs de Vercel (producción)
- Dashboard → proyecto → Deployments → Functions

## Estructura de archivos de configuración

```
GoTogether/
├── .npmrc                          # Configuración pnpm
├── .eslintrc.cjs                   # ESLint global
├── .prettierrc.json                # Prettier
├── tsconfig.base.json              # TypeScript base
├── pnpm-workspace.yaml             # Workspaces
│
├── apps/web/
│   ├── next.config.mjs             # Next.js config
│   ├── tailwind.config.ts          # Tailwind CSS
│   ├── postcss.config.js           # PostCSS
│   └── tsconfig.json               # TypeScript web
│
└── apps/api/
    ├── tsconfig.json               # TypeScript API
    └── vercel.json                 # Config Vercel serverless
```
