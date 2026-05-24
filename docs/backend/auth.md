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
     │               │               │ (JWKS endpoint)  │
     │               │               │─────────────────→│
     │               │               │←─────── ok ──────│
     │               │←─── user ─────│                  │
     │               │               │                  │
     │ 8. Todas las│ peticiones incluyen Authorization: Bearer <jwt>
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

## Validación JWT en el backend (SupabaseJwtStrategy)

El backend valida los JWT de Supabase usando:

1. Obtiene la clave pública desde `/.well-known/jwks.json` de Supabase
2. Extrae el `kid` del header del JWT
3. Busca la clave correspondiente en el JWKS
4. Verifica la firma con `RS256`
5. Valida `iss` (issuer = Supabase URL) y `aud` (audience = 'authenticated')

El resultado se almacena en `req.user` como:
```typescript
{ userId: string, email: string, role: UserRole | null }
```

> [!note] Desde v0.1.1-alpha, `SupabaseJwtStrategy.validate()` consulta la BD para incluir `role` en `req.user`. El rol está disponible en todos los endpoints protegidos con JWT.

## Guards disponibles

### SupabaseAuthGuard
- **Archivo:** `supabase-auth.guard.ts`
- **Función:** Valida JWT de Supabase
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

## Middleware de Next.js

**Archivo:** `apps/web/src/middleware.ts`

El middleware de Next.js protege las rutas del frontend:

- **Rutas protegidas** (requieren sesión Supabase): `/onboarding`, `/solicitud`, `/perfil`, `/reservas`, `/coordinacion`, `/valoracion`, `/supervision`, `/panel`, `/historial`
- **Rutas públicas:** `/`, `/explorar`, `/info`, `/nosotros`, `/contacto`, `/primeros-pasos`, `/legal`, `/auth`, `/api`, `/_next`, `/favicon.ico`
- **Sin protección (gate propio):** `/admin` — tiene su propio login con contraseña

Si un usuario no autenticado accede a una ruta protegida, es redirigido a `/auth/login?redirect=<ruta>`.

## Admin

La página `/admin` no usa autenticación de Supabase. Tiene su propio sistema:

1. Página muestra formulario de contraseña
2. Contraseña se valida contra el backend (`GET /admin/stats` con header `x-admin-key`)
3. Si es correcta, se almacena en `sessionStorage`
4. Todas las peticiones admin incluyen `x-admin-key: <contraseña>`

La contraseña se configura en:
- **Local:** `apps/api/.env` → `ADMIN_PASSWORD=admin`
- **Producción:** Variable de entorno en Vercel dashboard
