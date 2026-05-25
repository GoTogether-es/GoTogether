
---

## v0.1.0-alpha.31 — Mayo 2026 (backend quality + UX polish)

### Backend quality — Round 1 (10 critical fixes)
- 🔒 **Transactions** añadidas en 4 servicios: `availability` (deleteMany+createMany), `supervision` (create+update), `profiles` (upsert+role), `reports` (create+recalculateRating)
- 🔐 **Auth leaks** corregidos: servicios CRUD protegidos con `AdminGuard`, `GET /companions` ahora requiere JWT, emails ocultos en listado público
- 🏃 **Race condition** en `getOrCreateRoom` — `upsert` reemplaza check-then-act
- 📤 **Logout** simplificado: frontend maneja client-side signout, backend no llama a API deprecada
- 🔑 `AdminGuard` registrado explícitamente en `AuthModule.providers/exports`

### Backend quality — Round 2 (12 fixes)
- 🧹 **Matching filter** refactorizado: eliminado bloque duplicado que sobreescribía condiciones, lógica unificada en `profileConditions[]` con `AND`
- 🛡️ **Admin controller**: `UpdateBookingStatusDto` con `@IsEnum(BookingStatus)` en vez de `as any`
- 💳 **PaymentsService**: `ConfigService` reemplaza acceso directo a `process.env`
- 📧 **SupervisionService**: usa `MailService` compartido en vez de inicializar su propio `Resend`
- 🌐 **Vercel handler**: `GlobalExceptionFilter` aplicado en `api/index.ts` (antes solo en `main.ts`)
- 🔍 **3 índices DB** nuevos: `User(role)`, `Supervision(supervisorId)`, `CompanionProfile(verified)`
- 🔗 **Bookings**: `.then()` + `await` convertido a async/await puro

### UX
- 🎨 **Perfil**: sección de Discapacidad oculta para acompañantes en modo edición
- 🔗 **Panel guard**: redirige a `/perfil` si el usuario no es acompañante
- 🔧 **Middleware RBAC** eliminado (leía `user_metadata.role` que siempre era undefined — el rol está en la DB, no en Supabase Auth)

### Build
- 🔧 **zod/v4/core**: resolución robusta usando `require.resolve('zod/package.json')` + path filesystem, bypass del `exports` field
- 🗑️ Eliminada función muerta `isPublicRoute` que referenciaba constante borrada

### UX — Severidad alta (9 fixes)
- ✉️ **Login**: validación client-side de email (regex + error inline), mensajes específicos (red vs API vs genérico), hint de carpeta spam
- 🏗️ **Solicitud**: `SkeletonForm` en vez de pantalla en blanco durante carga, Cancelar vuelve a `/explorar`
- 🏗️ **Perfil**: JSX reestructurado (LocationSharingCard/PanelLink fuera del card de compañero)
- 📝 **Contacto**: formulario de contacto (nombre, email, mensaje) + código de país en teléfono
- 🔒 **Middleware**: control de acceso por rol (`/panel` solo compañeros, `/supervision` solo supervisores, `/admin` protegido)
- 📊 **Historial**: estado de error con Reintentar + skeleton en stats + fix del bug que mostraba UUID en vez del rating
- ⭐ **Valoración**: skeleton de carga (antes solo texto "Cargando...")
- 💬 **Chat**: auto-reconexión a los 3s cuando falla el canal Supabase

### UX — Severidad media/baja (8 fixes)
- 💾 **Registro cliente**: auto-save con `sessionStorage` (igual que acompañante)
- 🏷️ **Registro compañero**: preview en vivo de tags de especialidades
- 🔗 **Panel**: link "Ver detalle" en solicitudes abiertas + bordes de color (ámbar=abiertas, verde=asignadas)
- 🔄 **Explorar**: búsqueda y filtros persisten en URL (`?q=&d=&v=&p=`)
- ▶️ **Supervisión**: skeletons de carga en pestaña de reservas
- ⏳ **Admin**: spinners de carga en tabs + `window.confirm()` al rechazar + validación client-side en formulario de servicios
- ⌨️ **Valoración**: navegación de estrellas con teclado (flechas + tabIndex)
- ⬅️ **Registros**: botones "Volver" a selección de rol

### Build
- 🔧 **Webpack alias** para `zod/v4/core` en Next.js (compatibilidad ESM/CJS)
- 🏗️ Build corregido: 3 bugs de JSX desbalanceado, imports perdidos, tipos faltantes
- ✅ 287 tests pasando, 31 páginas estáticas compiladas