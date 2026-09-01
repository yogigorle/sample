import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useReportCount(listingId: string | null) {
  const [reportCount, setReportCount] = useState(0);

  useEffect(() => {
    if (!listingId) {
      setReportCount(0);
      return;
    }

    (async () => {
      const { count } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', listingId);
      setReportCount(count ?? 0);
    })();

    const channel = supabase
      .channel(`reports-${listingId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reports', filter: `listing_id=eq.${listingId}` },
        () => {
          setReportCount((prev) => prev + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingId]);

  return reportCount;
}
