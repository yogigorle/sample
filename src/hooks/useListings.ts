import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Listing, BoardMode } from '@/types';

const RECENT_WINDOW_MS = 90_000;

export function useListings(mode: BoardMode, selectedDate: string | null) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<string>>(new Set());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const fetchListings = useCallback(async () => {
    let query = supabase
      .from('listings')
      .select('*')
      .order('current_bid', { ascending: false })
      .order('created_at', { ascending: true });

    if (mode === 'daily' && selectedDate) {
      query = query.eq('bid_date', selectedDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to load leaderboard:', error.message);
      setLoading(false);
      return;
    }
    setListings((data ?? []) as Listing[]);
    setLoading(false);
  }, [mode, selectedDate]);

  const markRecent = useCallback((id: string) => {
    setRecentlyUpdated((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    const existing = timers.current.get(id);
    if (existing) clearTimeout(existing);
    const t = setTimeout(() => {
      setRecentlyUpdated((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      timers.current.delete(id);
    }, RECENT_WINDOW_MS);
    timers.current.set(id, t);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchListings();

    const channel = supabase
      .channel('leaderboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'listings' },
        (payload) => {
          const row = payload.new as Listing | null;
          if (row?.id) markRecent(row.id);
          fetchListings();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, [fetchListings, markRecent]);

  return { listings, loading, recentlyUpdated, refetch: fetchListings };
}
