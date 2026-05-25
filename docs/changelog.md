
---

## v0.1.0-alpha.30 — Mayo 2026 (UX audit fixes, build stability)

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