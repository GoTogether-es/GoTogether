---
tags: [backend, auth, security]
---

# Sistema de Autenticación y Autorización

GoTogether usa **Supabase Auth** para autenticación y **guards de NestJS** para autorización en la API.

## Flujo de autenticación

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Cliente │     │ Next.js  │     │  NestJS  │     │ Supabase │
│ (web)   │     │ Frontend │     │   API    │     │   Auth   │
└────┬────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │               │               │                  │
     │  1. Email     │               │                  │
     │──────────────→│               │                  │
     │               │ 2. POST       │                  │
     │               │ /magic-link   │                  │
     │               │──────────────→│ 3. generateLink  │
     │               │               │─────────────────→│
     │               │               │←──── link ───────│
     │               │ 4. Email      │                  │
     │←──────────────│ (Resend)      │                  │
     │               │               │                  │
     │ 5. Click link │               │                  │
     │─────────────────────────────────────────────────→│
     │←────────────── JWT + refresh token ──────────────│
     │               │               │                  │
     │ 6. GET /auth/me (Bearer JWT)  │                  │
     │──────────────→│──────────────→│                  │
     │               │               │ 7. validate JWT  │
     │               │               │ (local HS256 +   │
     │               │               │  getUser fallback)│
     │               │               │─────────────────→│
     │               │               │←─────── ok ──────│
     │               │←─── user ─────│                  │
     │               │               │                  │
     │ 8. Todas las peticiones incluyen Authorization: Bearer <jwt>
     │──────────────→│──────────────→│                  │
```

## Magic Link

1. Usuario introduce email en `/auth/login`
2. Frontend llama a `POST /auth/magic-link { email }`
3. Backend usa Supabase Admin API para generar un enlace mágico
4. Resend envía el email con el enlace
5. Usuario hace clic → Supabase valida el token → redirige a `/auth/verify`
6. Supabase SSR crea la sesión en cookies
7. Frontend obtiene el JWT de la sesión

### Archivos relevantes
- `apps/web/src/app/auth/login/page.tsx` — Formulario de email
- `apps/web/src/app/auth/verify/page.tsx` — Callback de Supabase
- `apps/web/src/app/auth/redirect/page.tsx` — Ruteo post-login
- `apps/api/src/modules/auth/auth.controller.ts` — Endpoint magic-link
- `apps/api/src/modules/auth/auth.service.ts` — Lógica de validación
- `apps/api/src/modules/auth/mail.templates.ts` — Plantillas HTML

## Validación JWT en el backend (SupabaseUserGuard)

Desde v0.1.1-alpha se usa `SupabaseUserGuard` que implementa:

1. **Fast path**: Verifica el JWT localmente con `jsonwebtoken.verify(token, SUPABASE_JWT_SECRET, { algorithms: ['HS256'] })` — sin llamadas HTTP a Supabase
2. **Fallback**: Si el JWT usa ES256/RS256, llama a `supabaseAdmin.auth.getUser(token)` para validar via la API de Supabase

El resultado se almacena en `req.user` como:
```typescript
{ userId: string, email: string, role: UserRole | null }
```

> [!note] La verificación HS256 local usa el `SUPABASE_JWT_SECRET` definido en las variables de entorno. Este secreto debe coincidir con el configurado en el dashboard de Supabase (Project Settings → API → JWT Settings).

## Guards disponibles

### SupabaseAuthGuard
- **Archivo:** `supabase-auth.guard.ts`
- **Función:** Valida JWT de Supabase (extiende SupabaseUserGuard)
- **Uso:** `@UseGuards(SupabaseAuthGuard)`
- **Aplicado en:** la mayoría de endpoints protegidos

### AdminGuard
- **Archivo:** `admin.guard.ts`
- **Función:** Valida header `x-admin-key` contra env var `ADMIN_PASSWORD`
- **Uso:** `@UseGuards(AdminGuard)`
- **Aplicado en:** todos los endpoints de `/admin`

### RolesGuard
- **Archivo:** `roles.guard.ts`
- **Función:** Verifica `req.user.role` contra los roles requeridos
- **Uso:** `@Roles(UserRole.ADMIN)` + `@UseGuards(RolesGuard)`
- **Estado:** Funcional desde v0.1.1-alpha

### RolesAuthGuard
- **Archivo:** `roles-auth.guard.ts`
- **Función:** Combina autenticación JWT + verificación de roles
- **Uso:** `@Roles(UserRole.SUPERVISOR)` + `@UseGuards(RolesAuthGuard)`
- **Estado:** Funcional desde v0.1.1-alpha

## Troubleshooting

### Error "Unexpected end of JSON input" al hacer login

**Causa:** NestJS convierte automáticamente un `return null` del controlador en una respuesta `204 No Content` (body vacío). Si el frontend intenta `response.json()` sobre un 204, obtiene este error.

**Solución:** En vez de devolver `null`, el controlador debe lanzar una excepción HTTP apropiada:

```typescript
// ❌ Incorrecto — NestJS devuelve 204 No Content
@Get('me')
getMe(@Request() req: any) {
  return this.service.getData(req.user.userId); // devuelve null
}

// ✅ Correcto — NestJS devuelve 404 con JSON
@Get('me')
async getMe(@Request() req: any) {
  const data = await this.service.getData(req.user.userId);
  if (!data) throw new NotFoundException('Not found');
  return data;
}
```

> [!warning] Cualquier endpoint que pueda devolver `null` DEBE manejar ese caso explícitamente con una excepción HTTP. NestJS no diferencia entre "sin datos" y "respuesta vacía" cuando el valor de retorno es `null`.

### Error ERR_REQUIRE_ESM con jose

**Causa:** `jwks-rsa` intenta hacer `require()` de `jose` (módulo ESM) en el runtime CommonJS de Vercel.

**Solución:** Se eliminó la dependencia `jwks-rsa` y se reemplazó por `SupabaseUserGuard` que usa `jsonwebtoken` (CJS nativo) y `supabaseAdmin.auth.getUser()` como fallback.

### Variables de entorno faltantes en Vercel

Si el API o el frontend no funcionan tras un deploy:

```bash
# Verificar que estas variables existen en Vercel Dashboard → Settings → Environment Variables:
NEXT_PUBLIC_SUPABASE_URL=https://ifuqhagjfwybzlsxkqhp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_JWT_SECRET=WOpAYB...
NEXT_PUBLIC_APP_URL=https://go-together-m2gp.vercel.app
NEXT_PUBLIC_API_URL=https://go-together-api-tau.vercel.app
RESEND_API_KEY=re_...
RESEND_FROM=GoTogether <info@gotogether.es>
```

## Middleware de Next.js

**Archivo:** `apps/web/src/middleware.ts`

El middleware de Next.js protege las rutas del frontend:

- **Rutas protegidas** (requieren sesión Supabase): `/onboarding`, `/solicitud`, `/perfil`, `/reservas`, `/coordinacion`, `/valoracion`, `/supervision`, `/panel`, `/historial`, `/admin`
- **Rutas públicas:** `/`, `/explorar`, `/info`, `/nosotros`, `/contacto`, `/primeros-pasos`, `/legal`, `/auth`, `/api`, `/_next`, `/favicon.ico`
- **Sin protección (gate propio):** `/admin` — tiene su propio login con contraseña

Si un usuario no autenticado accede a una ruta protegida, es redirigido a `/auth/login?redirect=<ruta>`.

> [!note] El middleware solo verifica autenticación (JWT). El control de acceso por rol se hace a nivel de página: `PanelPage` redirige a `/perfil` si el usuario no es compañero (`!profile?.companion`), y `SupervisionPage` verifica `user.role === 'SUPERVISOR'` vía `syncUser()` en un efecto client-side.

## Admin

La página `/admin` no usa autenticación de Supabase. Tiene su propio sistema:

1. Página muestra formulario de contraseña
2. Contraseña se valida contra el backend (`GET /admin/stats` con header `x-admin-key`)
3. Si es correcta, se almacena en `sessionStorage`
4. Todas las peticiones admin incluyen `x-admin-key: <contraseña>`

La contraseña se configura en:
- **Local:** `apps/api/.env` → `ADMIN_PASSWORD=admin`
- **Producción:** Variable de entorno en Vercel dashboard
