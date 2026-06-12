-- VibeU Database Migration
-- Migration: 001_initial_schema
-- Description: Creates initial tables for users, sessions, account statuses, and OTPs

-- Create enum type for account status
CREATE TYPE "AccountStatusName" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'TERMINATED');

-- Create account_statuses lookup table
CREATE TABLE "account_statuses" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" "AccountStatusName" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_statuses_pkey" PRIMARY KEY ("id")
);

-- Create unique index on account status name
CREATE UNIQUE INDEX "account_statuses_name_key" ON "account_statuses"("name");

-- Insert default account statuses
INSERT INTO "account_statuses" ("id", "name", "updated_at") VALUES
    (gen_random_uuid(), 'PENDING', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'ACTIVE', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'INACTIVE', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'TERMINATED', CURRENT_TIMESTAMP);

-- Create users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "account_status_id" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create unique index on email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Create index on deleted_at for soft delete queries
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- Add foreign key for account_status_id
ALTER TABLE "users" ADD CONSTRAINT "users_account_status_id_fkey" 
    FOREIGN KEY ("account_status_id") REFERENCES "account_statuses"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create sessions table
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- Create unique index on refresh_token
CREATE UNIQUE INDEX "sessions_refresh_token_key" ON "sessions"("refresh_token");

-- Create index on user_id for quick session lookup
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- Create index on deleted_at for soft delete queries
CREATE INDEX "sessions_deleted_at_idx" ON "sessions"("deleted_at");

-- Add foreign key for user_id
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Create otps table
CREATE TABLE "otps" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- Create index on user_id and code for quick OTP lookup
CREATE INDEX "otps_user_id_code_idx" ON "otps"("user_id", "code");

-- Add foreign key for user_id
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;
