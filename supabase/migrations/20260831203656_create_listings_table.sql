/*
# Create listings table for SocialBid leaderboard

1. New Tables
- `listings`
  - `id` (uuid, primary key, auto-generated)
  - `handle` (text, not null) — the creator's @handle, stored without the @ prefix
  - `platform` (text, not null) — 'instagram' or 'youtube'
  - `display_name` (text, not null) — human-friendly display name shown on the leaderboard
  - `profile_url` (text, not null) — full URL to the creator's profile
  - `current_bid` (integer, not null, default 0) — bid amount stored in paise (₹ × 100) to avoid rounding issues
  - `created_at` (timestamptz, default now()) — when the listing was first created
  - `last_bid_at` (timestamptz, default now()) — when the bid was last updated; used for "recently outbid" highlighting
2. Constraints
- UNIQUE constraint on (handle, platform) so the same creator can't be listed twice
- CHECK constraint ensuring platform is either 'instagram' or 'youtube'
- CHECK constraint ensuring current_bid is non-negative
3. Indexes
- Index on (current_bid DESC, created_at ASC) — the exact sort order of the leaderboard, so the main query is index-backed
- Index on last_bid_at for "recently outbid" filtering
4. Security
- Enable RLS on `listings`.
- Allow anon + authenticated full CRUD: SocialBid is a no-auth, public leaderboard. Anyone can view, submit, and outbid. USING (true) / WITH CHECK (true) is intentional because every row is intentionally public/shared.
5. Realtime
- Add the `listings` table to the supabase_realtime publication so the leaderboard updates live for all visitors without a refresh.
*/

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('instagram', 'youtube')),
  display_name text NOT NULL,
  profile_url text NOT NULL,
  current_bid integer NOT NULL DEFAULT 0 CHECK (current_bid >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_bid_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (handle, platform)
);

CREATE INDEX IF NOT EXISTS idx_listings_bid_created
  ON listings (current_bid DESC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_listings_last_bid_at
  ON listings (last_bid_at);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_listings" ON listings;
CREATE POLICY "anon_select_listings" ON listings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_listings" ON listings;
CREATE POLICY "anon_insert_listings" ON listings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_listings" ON listings;
CREATE POLICY "anon_update_listings" ON listings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_listings" ON listings;
CREATE POLICY "anon_delete_listings" ON listings FOR DELETE
  TO anon, authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE listings;
