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
- [[#confirmdialog|ConfirmDialog]] para cerrar sesión
- [[#routeannouncer|RouteAnnouncer]] para accesibilidad
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
- Cada notificación: icono Lucide según tipo (color semántico), título, body, timestamp
- Mapas de iconos: `Mail` (solicitud), `CheckCircle2` (aceptada), `XCircle` (rechazada),
  `PartyPopper` (completada), `Ban` (cancelada), `Star` (valoración)
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

## ConfirmDialog

**Archivo:** `confirm-dialog.tsx`
**Props:**
```typescript
{
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```

Modal de confirmación para acciones destructivas:
- Overlay con backdrop blur
- Icono AlertTriangle con color según variante (rojo/ámbar)
- Título y mensaje descriptivo
- Botones Confirmar/Cancelar
- Soporte loading state en el botón de confirmación
- Cierre con Escape
- Animación fadeUp al aparecer
- Bloqueo de scroll del body

**Usado en:** AppShell (confirmación de logout)

## StepIndicator

**Archivo:** `step-indicator.tsx`
**Props:**
```typescript
{
  steps: { label: string; description?: string }[];
  currentStep: number;
  className?: string;
}
```

Indicador de progreso para flujos multi-paso:
- Círculos numerados para cada paso
- Checkmark verde en pasos completados
- Paso actual resaltado con anillo azul
- Barras conectoras entre pasos
- Labels visibles en desktop, solo números en mobile
- `aria-current="step"` en el paso activo

**Usado en:** `onboarding/page.tsx`, `onboarding/register/client/page.tsx`, `onboarding/register/companion/page.tsx`

## Breadcrumbs

**Archivo:** `breadcrumbs.tsx`
**Props:**
```typescript
{
  items: { label: string; href?: string }[];
  className?: string;
}
```

Navegación jerárquica tipo migas de pan:
- Separador ChevronRight entre items
- Links navegables para items intermedios
- Último item resaltado con `aria-current="page"`
- Truncado automático con `max-w-[200px]`
- `aria-label="Ruta de navegación"`

**Usado en:** `explorar/[id]/page.tsx`, `coordinacion/[bookingId]/page.tsx`

## RouteAnnouncer

**Archivo:** `route-announcer.tsx`

Anunciador de cambios de ruta para lectores de pantalla:
- Detecta cambios en `usePathname()`
- Actualiza el contenido con `document.title`
- `role="status"` + `aria-live="polite"` + `aria-atomic="true"`
- Visualmente oculto (`sr-only`)
- Renderizado en AppShell para cobertura global

## Footer

**Archivo:** `footer.tsx`

Footer del sitio:
- Logo y descripción
- Enlaces: Explorar, Perfil, Solicitud
- Enlaces legales: Privacidad, Términos
- Copyright dinámico

## Skeleton

**Archivo:** `skeleton.tsx`

Placeholders de carga para estados loading:
- `SkeletonText` — línea de texto con ancho/alto personalizables
- `SkeletonAvatar` — círculo con tamaño personalizable
- `SkeletonCard` — placeholder de tarjeta (imagen + texto + badges + botón)
- `SkeletonBookingCard` — placeholder de tarjeta de reserva
- `SkeletonChat` — placeholder de chat (burbujas alternadas)
- `SkeletonForm` — placeholder de formulario (labels + inputs)
- `SkeletonPage` — placeholder de página (título + descripción + contenido)

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
