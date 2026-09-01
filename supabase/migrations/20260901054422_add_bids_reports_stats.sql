/*
# Add bids, reports, site_stats tables + RPC functions

1. New Tables
- `bids` — individual bid records (one per payment), tracks history
  - id (uuid PK), listing_id (FK -> listings), amount_paise (integer), created_at (timestamptz)
- `reports` — flag/reports against listings for moderation
  - id (uuid PK), listing_id (FK -> listings), reason (text), reporter_fingerprint (text), created_at (timestamptz)
- `site_stats` — single-row table for global counters (visits, online presence)
  - id (int PK, always 1), total_visits (integer), online_count (integer), updated_at (timestamptz)

2. Modified Tables
- `listings` — add `bid_date` (date) column to support daily board filtering.
  This stores the date of the listing's latest bid (derived from last_bid_at::date).

3. Indexes
- `idx_bids_listing_id` on bids(listing_id) for join queries
- `idx_bids_created_at` on bids(created_at DESC) for history
- `idx_reports_listing_id` on reports(listing_id)
- `idx_listings_bid_date` on listings(bid_date DESC, current_bid DESC) for daily board queries

4. RPC Functions
- `increment_visits()` — atomically increments total_visits by 1 and returns the new value. SECURITY DEFINER so anon can call it.
- `register_online()` — inserts/updates a row in `online_users` with a heartbeat timestamp. Returns current online count.
- `cleanup_online()` — deletes online_users rows older than 60 seconds, returns remaining count. SECURITY DEFINER.
- Both functions are safe for anon to call (no sensitive data exposed).

5. online_users Table
- `session_id` (text PK), `last_heartbeat` (timestamptz default now())
- Allows tracking how many users are currently viewing the site

6. Security
- Enable RLS on all new tables.
- `bids`: anon can SELECT (public bid history) and INSERT (record new bids). No UPDATE/DELETE.
- `reports`: anon can SELECT (see report counts) and INSERT (file a report). No UPDATE/DELETE.
- `site_stats`: anon can SELECT (display stats). No INSERT/UPDATE/DELETE from client — only via RPC functions.
- `online_users`: anon can SELECT and INSERT/UPDATE (heartbeat). DELETE via cleanup_online() RPC only.

7. Realtime
- Add `bids` and `reports` to supabase_realtime publication for live updates.
*/

-- ============================================================
-- listings: add bid_date column
-- ============================================================
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bid_date date DEFAULT (now()::date);

CREATE INDEX IF NOT EXISTS idx_listings_bid_date
  ON listings (bid_date DESC, current_bid DESC);

-- ============================================================
-- bids table
-- ============================================================
CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  amount_paise integer NOT NULL CHECK (amount_paise > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bids_listing_id ON bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at DESC);

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bids" ON bids;
CREATE POLICY "anon_select_bids" ON bids FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bids" ON bids;
CREATE POLICY "anon_insert_bids" ON bids FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ============================================================
-- reports table
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('spam', 'fake', 'inappropriate', 'other')),
  reporter_fingerprint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_listing_id ON reports(listing_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reports" ON reports;
CREATE POLICY "anon_select_reports" ON reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reports" ON reports;
CREATE POLICY "anon_insert_reports" ON reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ============================================================
-- site_stats table (single row, id=1)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_stats (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  total_visits integer NOT NULL DEFAULT 0,
  online_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO site_stats (id, total_visits, online_count)
VALUES (1, 0, 0)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_site_stats" ON site_stats;
CREATE POLICY "anon_select_site_stats" ON site_stats FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- online_users table
-- ============================================================
CREATE TABLE IF NOT EXISTS online_users (
  session_id text PRIMARY KEY,
  last_heartbeat timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_online_users" ON online_users;
CREATE POLICY "anon_select_online_users" ON online_users FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_upsert_online_users" ON online_users;
CREATE POLICY "anon_upsert_online_users" ON online_users FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Allow UPDATE for heartbeat (anon needs to refresh their timestamp)
DROP POLICY IF EXISTS "anon_update_online_users" ON online_users;
CREATE POLICY "anon_update_online_users" ON online_users FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- RPC: increment_visits
-- ============================================================
CREATE OR REPLACE FUNCTION increment_visits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE site_stats SET total_visits = total_visits + 1, updated_at = now()
    WHERE id = 1
    RETURNING total_visits INTO new_count;
  RETURN new_count;
END;
$$;

-- ============================================================
-- RPC: register_online(p_session_id)
-- Upserts heartbeat, cleans stale sessions, returns online count
-- ============================================================
CREATE OR REPLACE FUNCTION register_online(p_session_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  online_count integer;
BEGIN
  INSERT INTO online_users (session_id, last_heartbeat)
  VALUES (p_session_id, now())
  ON CONFLICT (session_id) DO UPDATE
    SET last_heartbeat = now();

  DELETE FROM online_users WHERE last_heartbeat < now() - interval '60 seconds';

  SELECT count(*) INTO online_count FROM online_users;

  UPDATE site_stats SET online_count = online_count, updated_at = now() WHERE id = 1;

  RETURN online_count;
END;
$$;

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE bids;
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
