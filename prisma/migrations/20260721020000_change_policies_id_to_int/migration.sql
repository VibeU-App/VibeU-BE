-- Recreate policies table with integer id autoincrement
ALTER TABLE "policies" DROP CONSTRAINT IF EXISTS "policies_pkey";
ALTER TABLE "policies" DROP COLUMN IF EXISTS "id";
ALTER TABLE "policies" ADD COLUMN "id" SERIAL PRIMARY KEY;
