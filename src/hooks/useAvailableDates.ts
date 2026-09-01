import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useAvailableDates() {
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('bid_date')
        .not('bid_date', 'is', null)
        .order('bid_date', { ascending: false })
        .limit(14);

      if (error || !data) return;

      const unique = [...new Set(data.map((r) => r.bid_date as string))];
      setDates(unique);
    })();
  }, []);

  return dates;
}
