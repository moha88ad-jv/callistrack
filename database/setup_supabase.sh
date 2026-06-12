#!/bin/bash
# Run this script once to set up the CallisTrack schema on Supabase.
# Requires psql to be installed locally.

DB_URL="postgresql://postgres:BoMrHs2004%40%23!@db.gwkpryeeilfdhfpqbwgb.supabase.co:5432/postgres"

echo "=== Applying schema (001_init.sql) ==="
psql "$DB_URL" -f "$(dirname "$0")/001_init.sql"

echo "=== Inserting seed data (002_seed.sql) ==="
psql "$DB_URL" -f "$(dirname "$0")/002_seed.sql"

echo "=== Done! ==="
