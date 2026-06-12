-- CallisTrack – Datenbankschema für Supabase / PostgreSQL
-- Ausführen im Supabase SQL-Editor oder via psql

-- uuid-ossp ist in Supabase bereits aktiviert
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username       VARCHAR(50)  UNIQUE NOT NULL,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  bio            TEXT,
  level          INT  NOT NULL DEFAULT 1,
  points         INT  NOT NULL DEFAULT 0,
  is_public      BOOLEAN NOT NULL DEFAULT TRUE,
  is_admin       BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Spots ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spots (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  address     VARCHAR(255),
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  equipment   TEXT[]  NOT NULL DEFAULT '{}',
  status      VARCHAR(30) NOT NULL DEFAULT 'unvalidated'
              CHECK (status IN ('validated','unvalidated','user-created','top-rated','archived')),
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  osm_id      BIGINT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Workouts ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workouts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id      UUID REFERENCES spots(id) ON DELETE SET NULL,
  title        VARCHAR(150),
  duration_sec INT,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Exercises ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exercises (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  reps       INT NOT NULL DEFAULT 0,
  sets       INT NOT NULL DEFAULT 0
);

-- ─── Ratings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id    UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stars      SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (spot_id, user_id)
);

-- ─── Activities ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(20) NOT NULL CHECK (type IN ('workout','rating','spot')),
  description TEXT NOT NULL,
  ref_id      UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_spots_status    ON spots(status);
CREATE INDEX IF NOT EXISTS idx_spots_lat_lng   ON spots(lat, lng);
CREATE INDEX IF NOT EXISTS idx_ratings_spot    ON ratings(spot_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user   ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);

-- ─── updated_at Trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_spots_updated ON spots;
CREATE TRIGGER trg_spots_updated
  BEFORE UPDATE ON spots FOR EACH ROW EXECUTE FUNCTION set_updated_at();
