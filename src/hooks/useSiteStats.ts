import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getFingerprint } from '@/lib/format';

export function useSiteStats() {
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const sessionId = useRef<string>('');

  useEffect(() => {
    sessionId.current = getFingerprint() + '-' + Math.random().toString(36).slice(2, 8);

    // Fetch initial stats
    (async () => {
      const { data } = await supabase
        .from('site_stats')
        .select('total_visits, online_count')
        .eq('id', 1)
        .maybeSingle();
      if (data) {
        setTotalVisits(data.total_visits);
        setOnlineCount(data.online_count);
      }
      setStatsLoading(false);
    })();

    // Increment visits once per session
    (async () => {
      const { data } = await supabase.rpc('increment_visits');
      if (data) setTotalVisits(data as number);
    })();

    // Heartbeat: register online, poll every 15s
    const heartbeat = async () => {
      const { data } = await supabase.rpc('register_online', {
        p_session_id: sessionId.current,
      });
      if (data) setOnlineCount(data as number);
    };

    heartbeat();
    const interval = setInterval(heartbeat, 15000);

    // Cleanup on unmount / page close
    const onUnload = () => {
      navigator.sendBeacon(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cleanup-session`,
        JSON.stringify({ session_id: sessionId.current }),
      );
    };
    window.addEventListener('beforeunload', onUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, []);

  return { onlineCount, totalVisits, statsLoading };
}
