-- Seed account statuses lookup table
-- These are required for the application to work
INSERT INTO account_statuses (id, name, created_at, updated_at) VALUES
  (1, 'PENDING', NOW(), NOW()),
  (2, 'ACTIVE', NOW(), NOW()),
  (3, 'INACTIVE', NOW(), NOW()),
  (4, 'TERMINATED', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
