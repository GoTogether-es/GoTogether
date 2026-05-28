-- AlterTable
ALTER TABLE "CompanionProfile" ADD COLUMN IF NOT EXISTS "stripeAccountId" TEXT;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "estimatedHours" DOUBLE PRECISION DEFAULT 1.0;
