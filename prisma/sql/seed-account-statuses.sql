-- Seed account statuses lookup table
-- These are required for the application to work
INSERT INTO account_statuses (id, name, created_at, updated_at) VALUES
  (gen_random_uuid(), 'PENDING', NOW(), NOW()),
  (gen_random_uuid(), 'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'INACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'TERMINATED', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
