---
tags: [troubleshooting, debug, errors]
---

# Troubleshooting

Errores comunes y sus soluciones.

## Build / Deploy

### `ERR_REQUIRE_ESM: require() of ES Module jose`

**Contexto:** Vercel serverless, Node.js 20.x

**Causa:** `jwks-rsa@4.x` depende de `jose@6.x` (ESM-only), que no puede ser importado con `require()` en Vercel.

**Solución aplicada:** `jwks-rsa` fijado a v3.2.2 (usa `jose@4.x`, CJS compatible).

```json
// apps/api/package.json
"jwks-rsa": "^3.2.2"
```

---

### `Module not found: Package path ./v4/core is not exported from package zod`

**Contexto:** Build de Next.js (webpack) en Vercel

**Causa:** `@hookform/resolvers@5.2.2` importa `zod/v4/core` pero `zod@4.4.3` no exporta ese subpath para CJS.

**Solución aplicada:** Webpack alias en `next.config.mjs`:

```js
webpack: (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    'zod/v4/core$': path.resolve(__dirname, 'node_modules/zod/v4/core/index.cjs'),
  };
  return config;
},
```

---

### `error TS2304: Cannot find name 'jest'`

**Contexto:** Build de producción de la API (`tsc -p tsconfig.build.json`)

**Causa:** El `tsconfig.build.json` no excluía `__mocks__/` ni `test-utils/`. Los archivos de mock usan `jest.fn` que no existe en producción.

**Solución aplicada:** Añadido al `exclude` de `tsconfig.build.json`:

```json
"exclude": ["node_modules", "dist", "src/**/*.spec.ts", "src/__mocks__/**", "src/test-utils/**"]
```

---

### `useSearchParams() should be wrapped in a suspense boundary`

**Contexto:** Build de Next.js, página `/explorar`

**Causa:** `useSearchParams()` en un Client Component sin `<Suspense>` padre causa error de prerenderizado en producción.

**Solución:** Envolver el componente en `<Suspense>` con un fallback de carga:

```tsx
export default function ExplorarPage() {
  return (
    <Suspense fallback={<SkeletonGrid />}>
      <ExplorarContent />
    </Suspense>
  );
}
```

---

### Vercel cold start > 15s

**Causa:** La API NestJS tarda en inicializarse en frío (carga de módulos, Prisma connect, JWKS fetch).

**Mitigaciones:**
- Prisma Client generado en build (no en runtime)
- `cachedExpressApp` en `api/index.ts` (singleton pattern)
- Memoria: 1769MB (máximo en hobby)
- Región `fra1` (Frankfurt) para usuarios españoles

---

## Desarrollo local

### `pnpm dev` no arranca ambos servidores

**Causa:** Faltan variables de entorno.

**Solución:**
```bash
# apps/api/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
RESEND_API_KEY=re_...
ADMIN_PASSWORD=admin
```

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

---

### Prisma Client desactualizado

**Síntoma:** `Property 'xxx' does not exist on type 'PrismaClient'`

**Solución:**
```bash
pnpm --filter api exec prisma generate
```

---

### Tests fallan con `Cannot find module 'zod/v4/core'`

**Solución:** Ya resuelto en `jest.config.cjs`:
```js
moduleNameMapper: {
  '^zod/v4/core$': '<rootDir>/node_modules/zod/v4/core/index.cjs',
}
```

---

### `jest-haste-map: duplicate manual mock found: resend`

**Causa:** Carpeta `dist/__mocks__/` con artefactos de build viejos.

**Solución:**
```bash
rm -rf apps/api/dist/__mocks__
```

---

### Supabase Realtime no recibe eventos

**Causas comunes:**
1. La tabla no está en la publicación `supabase_realtime`
2. RLS está bloqueando el acceso

**Verificación:**
```sql
-- Ver tablas en realtime
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Añadir tabla
ALTER PUBLICATION supabase_realtime ADD TABLE "ChatMessage";
```

---

### CORS: peticiones desde el frontend bloqueadas

**Síntoma:** `Access to fetch at 'https://api.xxx' from origin 'https://web.xxx' has been blocked by CORS`

**Solución:** El backend ya configura CORS en `api/index.ts`:
```typescript
cors: { origin: [process.env.FRONTEND_URL, process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000'].filter(Boolean), credentials: true }
```

Si el error persiste, verifica que `FRONTEND_URL` y `NEXT_PUBLIC_APP_URL` estén configurados en Vercel y que apunten al dominio correcto del frontend.
