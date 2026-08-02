-- Drop foreign key constraint if it exists
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_account_status_id_fkey";

-- Update users.account_status_id to string integers first, by joining with account_statuses table
UPDATE "users"
SET "account_status_id" = CASE
  WHEN a."name" = 'PENDING' THEN '1'
  WHEN a."name" = 'ACTIVE' THEN '2'
  WHEN a."name" = 'INACTIVE' THEN '3'
  WHEN a."name" = 'TERMINATED' THEN '4'
  ELSE '1'
END
FROM "account_statuses" a
WHERE "users"."account_status_id" = a."id";

-- Fallback for any records that might already be numeric but still formatted as text
UPDATE "users"
SET "account_status_id" = '1'
WHERE "account_status_id" NOT IN ('1', '2', '3', '4');

-- Alter users table: change type of account_status_id to integer
ALTER TABLE "users" ALTER COLUMN "account_status_id" TYPE INTEGER USING "account_status_id"::integer;

-- Truncate account_statuses table and recreate it with integer id
TRUNCATE TABLE "account_statuses" CASCADE;
ALTER TABLE "account_statuses" DROP CONSTRAINT IF EXISTS "account_statuses_pkey";
ALTER TABLE "account_statuses" DROP COLUMN "id";
ALTER TABLE "account_statuses" ADD COLUMN "id" SERIAL PRIMARY KEY;

-- Seed initial account statuses matching 1, 2, 3, 4
INSERT INTO "account_statuses" ("id", "name", "updated_at") VALUES 
(1, 'PENDING', NOW()),
(2, 'ACTIVE', NOW()),
(3, 'INACTIVE', NOW()),
(4, 'TERMINATED', NOW());

-- Recreate foreign key constraint
ALTER TABLE "users" ADD CONSTRAINT "users_account_status_id_fkey" FOREIGN KEY ("account_status_id") REFERENCES "account_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Ensure recovery_email column exists on users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "recovery_email" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "users_recovery_email_key" ON "users"("recovery_email");

-- CreateTable
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "university" TEXT,
    "bio" TEXT,
    "avatar_seed" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "personality_archetype_id" TEXT,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "personality_archetypes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "traits" TEXT[],
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personality_archetypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "hobbies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hobbies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "profile_hobbies" (
    "profile_id" INTEGER NOT NULL,
    "hobby_id" INTEGER NOT NULL,

    CONSTRAINT "profile_hobbies_pkey" PRIMARY KEY ("profile_id","hobby_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "photos" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "questionnaire_questions" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questionnaire_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "questionnaire_options" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questionnaire_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_questionnaire_answers" (
    "id" TEXT NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_questionnaire_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_user_id_key" ON "profiles"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "personality_archetypes_name_key" ON "personality_archetypes"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "hobbies_name_key" ON "hobbies"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "user_questionnaire_answers_profile_id_question_id_key" ON "user_questionnaire_answers"("profile_id", "question_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_personality_archetype_id_fkey" FOREIGN KEY ("personality_archetype_id") REFERENCES "personality_archetypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "profile_hobbies" ADD CONSTRAINT "profile_hobbies_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "profile_hobbies" ADD CONSTRAINT "profile_hobbies_hobby_id_fkey" FOREIGN KEY ("hobby_id") REFERENCES "hobbies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "photos" ADD CONSTRAINT "photos_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "questionnaire_options" ADD CONSTRAINT "questionnaire_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questionnaire_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_questionnaire_answers" ADD CONSTRAINT "user_questionnaire_answers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_questionnaire_answers" ADD CONSTRAINT "user_questionnaire_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questionnaire_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_questionnaire_answers" ADD CONSTRAINT "user_questionnaire_answers_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "questionnaire_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
