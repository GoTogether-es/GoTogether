-- Elimina la supervisión (Supervision, SupervisionInvite) y la ubicación en
-- tiempo real (ClientLocation). El rol SUPERVISOR se retira del enum UserRole
-- recreándolo sin ese valor (PG no permite DROP VALUE cuando el enum está en
-- uso como tipo de columna). Los usuarios que tuvieran ese rol se degradan a
-- CLIENT antes de recrear el enum.

ALTER TABLE "SupervisionInvite" DROP CONSTRAINT IF EXISTS "SupervisionInvite_supervisorId_fkey";
ALTER TABLE "Supervision" DROP CONSTRAINT IF EXISTS "Supervision_supervisorId_fkey";
ALTER TABLE "Supervision" DROP CONSTRAINT IF EXISTS "Supervision_clientId_fkey";
ALTER TABLE "ClientLocation" DROP CONSTRAINT IF EXISTS "ClientLocation_clientId_fkey";

DROP TABLE IF EXISTS "ClientLocation";
DROP TABLE IF EXISTS "SupervisionInvite";
DROP TABLE IF EXISTS "Supervision";

UPDATE "User" SET "role" = 'CLIENT' WHERE "role" = 'SUPERVISOR';

ALTER TYPE "UserRole" RENAME TO "UserRole_legacy";
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'COMPANION', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::text::"UserRole");
DROP TYPE "UserRole_legacy";