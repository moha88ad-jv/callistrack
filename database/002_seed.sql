-- CallisTrack Seed-Daten für Supabase
-- Passwort für alle Test-Accounts: Test1234!
-- (bcryptjs Hash von "Test1234!" mit 10 Salt-Rounds)

INSERT INTO users (id, username, email, password_hash, bio, level, points, is_public, is_admin, email_verified)
VALUES
  ('a0000000-0000-0000-0000-000000000001',
   'StreetWarrior', 'test@example.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'Leidenschaftlicher Calisthenics-Athlet aus Mainz', 4, 320, TRUE, FALSE, TRUE),

  ('a0000000-0000-0000-0000-000000000002',
   'AdminUser', 'admin@example.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   NULL, 1, 0, FALSE, TRUE, TRUE),

  ('a0000000-0000-0000-0000-000000000003',
   'DeleteMe', 'delete@example.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   NULL, 1, 0, TRUE, FALSE, TRUE),

  ('a0000000-0000-0000-0000-000000000004',
   'MaxPower92', 'max@example.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   NULL, 9, 1200, TRUE, FALSE, TRUE),

  ('a0000000-0000-0000-0000-000000000005',
   'StreetKing', 'king@example.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   NULL, 12, 1800, TRUE, FALSE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO spots (id, name, description, address, lat, lng, equipment, status, created_by)
VALUES
  ('b0000000-0000-0000-0000-000000000001',
   'Mainz Volkspark',
   'Großer Calisthenics-Park mit verschiedenen Stangen und Barren.',
   'Volkspark, 55131 Mainz', 50.030, 8.215,
   ARRAY['Klimmzugstange','Barren','Monkey Bars','Sprossenwand'],
   'validated', NULL),

  ('b0000000-0000-0000-0000-000000000002',
   'Rheinufer Workout-Station',
   'Kleine aber feine Station direkt am Rhein.',
   'Rheinufer, 55116 Mainz', 50.045, 8.245,
   ARRAY['Klimmzugstange','Barren','Ringe'],
   'user-created', 'a0000000-0000-0000-0000-000000000001'),

  ('b0000000-0000-0000-0000-000000000003',
   'Hartenberg-Park Outdoor',
   'Moderner Outdoor-Fitnesspark mit vielen verschiedenen Stationen.',
   'Hartenbergpark, 55122 Mainz', 50.015, 8.255,
   ARRAY['Klimmzugstange','Barren','Dip-Station','Hantelbank'],
   'top-rated', NULL),

  ('b0000000-0000-0000-0000-000000000004',
   'Stadtpark Turnstation',
   'Klassische Turnstation mit Basics.',
   'Stadtpark, 55118 Mainz', 50.040, 8.270,
   ARRAY['Klimmzugstange','Barren'],
   'validated', NULL),

  ('b0000000-0000-0000-0000-000000000005',
   'Gonsenheim Outdoor-Gym',
   'Kleiner Park in Gonsenheim mit guter Ausstattung.',
   'Gonsenheim, 55122 Mainz', 50.025, 8.230,
   ARRAY['Klimmzugstange','Barren'],
   'validated', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO ratings (spot_id, user_id, stars, comment)
VALUES
  ('b0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000004', 5, 'Toller Park! Sehr gut ausgestattet.'),
  ('b0000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000001', 5, 'Bester Spot in Mainz!'),
  ('b0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000005', 4, 'Schöne Lage, aber Stangen könnten höher sein.')
ON CONFLICT (spot_id, user_id) DO NOTHING;
