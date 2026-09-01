export type Platform = 'instagram' | 'youtube';

export interface Listing {
  id: string;
  handle: string;
  platform: Platform;
  display_name: string;
  profile_url: string;
  current_bid: number; // stored in paise (₹ × 100)
  created_at: string;
  last_bid_at: string;
  bid_date: string | null; // date of latest bid, for daily board filtering
}

export interface Bid {
  id: string;
  listing_id: string;
  amount_paise: number;
  created_at: string;
}

export type ReportReason = 'spam' | 'fake' | 'inappropriate' | 'other';

export interface Report {
  id: string;
  listing_id: string;
  reason: ReportReason;
  reporter_fingerprint: string;
  created_at: string;
}

export interface SiteStats {
  id: number;
  total_visits: number;
  online_count: number;
  updated_at: string;
}

export type BoardMode = 'all-time' | 'daily';
