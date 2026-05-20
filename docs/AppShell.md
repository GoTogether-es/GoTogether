---
tags: [frontend, components, appshell]
---

# AppShell

**Archivo:** `apps/web/src/components/app-shell.tsx`
**Props:** `{ children: React.ReactNode }`

Layout principal de la aplicación. Renderiza el header, contenido y footer para todas las páginas.

## Header

- Logo (`sinfondo.png`) con enlace a `/`
- Navegación principal (desktop) y menú móvil
- Botones de usuario (sesión/no sesión)
- [[NotificationBell]] integrada
- Skip link de accesibilidad (#main-content)

## Navegación por rol

| Rol | Nav principal | Nav secundaria |
|-----|--------------|----------------|
| No autenticado | Cómo funciona, Explorar | Entrar |
| Cliente | Cómo funciona, Explorar | Mis Reservas, Historial, Mi Perfil |
| Acompañante | Cómo funciona, Panel | Mis Reservas, Historial, Mi Perfil |
| Supervisor | Cómo funciona, Explorar | Mis Reservas, Historial, Supervisión, Mi Perfil |

- "Supervisión" solo visible para usuarios con rol `SUPERVISOR`
- "Panel" solo visible para acompañantes (`isCompanion`)
- Todos los enlaces usan `routes.*` desde `@/lib/routes`

## Estado

- `session` — sesión de Supabase
- `isCompanion` — tiene CompanionProfile
- `isSupervisor` — rol SUPERVISOR en metadatos de usuario

## Menú móvil

Overlay con cierre al hacer clic fuera, tecla Escape o cambio de ruta. Mismos enlaces que desktop.

## Funcionalidades integradas

- **NotificationBell**: campana con badge de notificaciones no leídas, suscripción Realtime
- **ConfirmDialog**: modal de confirmación para cerrar sesión
- **RouteAnnouncer**: anuncia cambios de página a lectores de pantalla
- **Footer**: enlaces legales, copyright
