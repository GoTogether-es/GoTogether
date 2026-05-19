---
tags: [frontend, components, react]
---

# Componentes del Frontend

Componentes reutilizables bajo `apps/web/src/components/`.

## AppShell

**Archivo:** `app-shell.tsx`
**Props:** `{ children: React.ReactNode }`

Layout principal de la aplicación. Renderiza:
- Header sticky con logo, navegación y botones de usuario
- Navegación por rol (Panel para acompañantes, Explorar para otros)
- [[NotificationBell]] integrada en la barra
- Menú móvil con overlay
- Footer
- Skip link para accesibilidad

**Estado:** `session` (Supabase), `isCompanion` (de perfil)

### Navegación

| Rol | Nav principal | Nav secundaria |
|-----|--------------|----------------|
| No autenticado | Explorar | Entrar |
| Cliente | Explorar | Mis Reservas, Mi Perfil |
| Acompañante | Panel | Mis Reservas, Mi Perfil |

## FileUpload

**Archivo:** `file-upload.tsx`
**Props:**
```typescript
{
  onUploaded: (url: string) => void;
  accept: string;        // ".pdf,.jpg,.jpeg,.png"
  label: string;
  helper?: string;
  uploadedUrl?: string;
}
```

Componente de subida de archivos con:
- Botón con estilo drag & drop
- Subida directa a Supabase Storage (bucket `certificates`)
- Infiere MIME type si `file.type` está vacío
- Spinner durante la subida
- Check verde al completar
- Estados: idle, uploading, done, error
- Preview del nombre del archivo

**Usado en:** `onboarding/register/client`, `onboarding/register/companion`

## AvatarUpload

**Archivo:** `avatar-upload.tsx`
**Props:**
```typescript
{
  avatarUrl: string | null;
  onUploaded: (url: string) => void;
  readOnly?: boolean;
}
```

Subida de foto de perfil:
- Avatar circular 128px con borde blanco y sombra
- Icono de cámara al hover (solo si `readOnly: false`)
- Subida a Supabase Storage (bucket `avatars`)
- Path: `{userId}/{timestamp}.{ext}`
- Infiere MIME type de la extensión
- Valida tamaño (5 MB) y tipo (imágenes)
- Fallback: icono SVG de usuario

**Usado en:** `perfil/page.tsx`

## NotificationBell

**Archivo:** `notification-bell.tsx`

Campanita de notificaciones en la barra de navegación:
- Icono Bell con badge rojo (contador de no leídas)
- Dropdown con lista de notificaciones
- Cada notificación: icono emoji según tipo, título, body, timestamp
- Click → marca como leída + navega a `/reservas`
- Botón "Marcar todas leídas"
- Suscripción Realtime a `Notification` para nuevas notificaciones
- Polling REST como fuente inicial

**Integrado en:** AppShell

## CompanionCard

**Archivo:** `companion-card.tsx`
**Props:** `CompanionSummary`

Tarjeta de acompañante para el grid de `/explorar`:
- Imagen de perfil (Next.js Image) o fallback SVG
- Nombre, headline/bio
- Badges: especialidades, rating con estrella, años en plataforma
- Badge de verificación (ShieldCheck verde)
- Botón "Ver perfil" → `/explorar/:id`

## Footer

**Archivo:** `footer.tsx`

Footer del sitio:
- Logo y descripción
- Enlaces: Explorar, Perfil, Solicitud
- Enlaces legales: Privacidad, Términos
- Copyright dinámico

## Skeleton

**Archivo:** `skeleton.tsx`

Placeholders de carga:
- `Skeleton` — rectángulo genérico con animación pulse
- `CompanionCardSkeleton` — placeholder de tarjeta
- `CompanionGridSkeleton` — grid de 6 skeletons

## LinkButton

**Archivo:** `link-button.tsx`
**Props:** `{ href: string, variant?: 'primary' | 'secondary' | 'ghost', className?: string, children: React.ReactNode }`

Wrapper de `next/link` que renderiza un `Button` de `@gotogether/ui`.

## Paquete `@gotogether/ui`

**Archivo:** `packages/ui/src/index.tsx`

Componentes base del design system:

```typescript
Section    // <section> con clase gt-section
Container  // <div> con clase gt-container (max-width: 1120px)
Button     // <button> con clases gt-button + gt-button--{variant}
Card       // <div> con clase gt-card
```

Variantes de `Button`: `primary`, `secondary`, `ghost`.

## Hooks y utilidades

### `useProfile()` / `useUpsertProfile()`
**Archivo:** `services/queries.ts`

Hooks de React Query:
- `useProfile()` → `getProfile()` con staleTime 5min
- `useUpsertProfile()` → `upsertProfile()` con invalidación de `['profile']`

### `createClient()`
**Archivo:** `lib/supabase/client.ts`

Singleton del cliente Supabase para el navegador. Usa `createBrowserClient` de `@supabase/ssr`. Lee `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (fallback a `ANON_KEY`).

### `getAuthHeaders()`
**Archivo:** `services/api.ts`

Obtiene headers de autenticación con el JWT de Supabase para peticiones a la API.

### Schemas Zod
**Archivo:** `lib/schemas.ts`

Schemas de validación para formularios:
- `solicitudSchema` — formulario de solicitud
- `clientRegistrationSchema` — registro de cliente
- `companionRegistrationSchema` — registro de acompañante
- `perfilSchema` — edición de perfil
- `valoracionSchema` — formulario de valoración

### Rutas
**Archivo:** `lib/routes.ts`

Objeto centralizado con todas las rutas de la aplicación.

### Tipos
**Archivo:** `types/index.ts`

Tipos TypeScript para:
- `UserProfile`, `CompanionProfileData`
- `CompanionSummary`, `CompanionDetail`
- `BookingData`, `BookingStatus`, `PaymentData`
- `ChatRoomData`, `ChatMessageData`
- `ReportData`, `SupervisionData`, `SupervisorData`
- `UserSearchResult`, `PaginatedResponse<T>`
- `AdminStats`, `AdminUser`, `AdminPending`
- `NotificationData`, `HealthStatus`
