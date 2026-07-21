-- Drop existing new tables if they exist to rebuild them with the correct Int ID types
DROP TABLE IF EXISTS "user_questionnaire_answers" CASCADE;
DROP TABLE IF EXISTS "questionnaire_options" CASCADE;
DROP TABLE IF EXISTS "questionnaire_questions" CASCADE;
DROP TABLE IF EXISTS "photos" CASCADE;
DROP TABLE IF EXISTS "profile_hobbies" CASCADE;
DROP TABLE IF EXISTS "profiles" CASCADE;
DROP TABLE IF EXISTS "personality_archetypes" CASCADE;
DROP TABLE IF EXISTS "hobbies" CASCADE;

-- CreateTable
CREATE TABLE "personality_archetypes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "traits" TEXT[],
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personality_archetypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hobbies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hobbies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "university" TEXT,
    "bio" TEXT,
    "avatar_seed" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "personality_archetype_id" INTEGER,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_hobbies" (
    "profile_id" INTEGER NOT NULL,
    "hobby_id" INTEGER NOT NULL,

    CONSTRAINT "profile_hobbies_pkey" PRIMARY KEY ("profile_id","hobby_id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaire_questions" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questionnaire_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaire_options" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questionnaire_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_questionnaire_answers" (
    "id" TEXT NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "selected_option_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_questionnaire_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personality_archetypes_name_key" ON "personality_archetypes"("name");
CREATE UNIQUE INDEX "hobbies_name_key" ON "hobbies"("name");
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");
CREATE UNIQUE INDEX "user_questionnaire_answers_profile_id_question_id_key" ON "user_questionnaire_answers"("profile_id", "question_id");

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
