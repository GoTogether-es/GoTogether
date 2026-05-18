---
tags: [database, migrations, supabase]
---

# Historial de migraciones

Las migraciones se aplican directamente en Supabase usando la herramienta `supabase_apply_migration`. No se usa Prisma Migrate.

## Lista de migraciones aplicadas

### 1. `create_avatars_bucket`
**Fecha:** Mayo 2026

Crea el bucket `avatars` en Supabase Storage con políticas RLS:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/png','image/jpeg','image/jpg','image/webp']);

-- Políticas: INSERT/UPDATE/DELETE para authenticated
-- Política: SELECT para public
```

### 2. `add_verified_to_profile`
**Fecha:** Mayo 2026

Añade campo `verified` al modelo `Profile` para verificación de documentos de discapacidad:

```sql
ALTER TABLE "Profile" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;
```

> [!note] El modelo `CompanionProfile` ya tenía el campo `verified` desde el schema inicial de Prisma.

### 3. `enable_chat_realtime_rls`
**Fecha:** Mayo 2026

Habilita RLS en `ChatMessage` y añade replicación para Supabase Realtime:

```sql
ALTER TABLE "ChatMessage" ENABLE ROW LEVEL SECURITY;

-- Política SELECT: participantes del booking
-- Política INSERT: participantes del booking

ALTER PUBLICATION supabase_realtime ADD TABLE "ChatMessage";
```

### 4. `add_default_uuid_to_chatmessage`
**Fecha:** Mayo 2026

Añade `DEFAULT gen_random_uuid()` a la columna `id` de `ChatMessage` para que los inserts directos desde el frontend (Supabase JS) funcionen sin especificar ID:

```sql
ALTER TABLE "ChatMessage" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
```

> [!warning] Las tablas creadas por Prisma no tienen `DEFAULT` en las columnas `id` porque Prisma genera UUIDs en el cliente. Si se inserta directamente desde Supabase JS sin especificar `id`, falla con error de NOT NULL.

### 5. `create_notifications_table`
**Fecha:** Mayo 2026

Crea la tabla `Notification` con RLS y replicación Realtime:

```sql
CREATE TABLE "Notification" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "bookingId" TEXT,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
-- Políticas: SELECT/UPDATE solo para el dueño (userId = auth.uid()::text)

ALTER PUBLICATION supabase_realtime ADD TABLE "Notification";
```

## Estructura de buckets Storage

### `certificates`
- **Público:** sí (lectura)
- **Límite:** 10 MB
- **MIME types:** `image/png`, `image/jpeg`, `image/jpg`, `application/pdf`
- **RLS:** SELECT público, INSERT authenticated
- **Uso:** certificados penales, certificados sexuales, documentos de discapacidad

### `avatars`
- **Público:** sí (lectura)
- **Límite:** 5 MB
- **MIME types:** `image/png`, `image/jpeg`, `image/jpg`, `image/webp`
- **RLS:** SELECT público, INSERT/UPDATE/DELETE authenticated
- **Uso:** fotos de perfil de usuario
