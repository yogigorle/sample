import { Loader2, Trophy } from 'lucide-react';
import type { Listing } from '@/types';
import { LeaderboardRow } from './LeaderboardRow';
import { Podium } from './Podium';

interface Props {
  listings: Listing[];
  loading: boolean;
  recentlyUpdated: Set<string>;
  onOutbid: (listing: Listing) => void;
  onReport: (listing: Listing) => void;
}

export function Leaderboard({ listings, loading, recentlyUpdated, onOutbid, onReport }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-32 text-stone-400">
        <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
        <p className="text-sm font-medium">Loading the board...</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-200">
          <Trophy className="h-7 w-7 text-stone-400" />
        </div>
        <div>
          <p className="text-lg font-bold text-stone-900">No bids yet</p>
          <p className="mt-1 text-sm text-stone-500">Be the first to claim #1.</p>
        </div>
      </div>
    );
  }

  const top3 = listings.slice(0, 3);
  const rest = listings.slice(3);

  return (
    <div className="space-y-3">
      {/* Podium for top 3 */}
      {top3.length > 0 && (
        <Podium listings={top3} onOutbid={onOutbid} />
      )}

      {/* Remaining rows */}
      {rest.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {rest.map((listing, i) => (
            <LeaderboardRow
              key={listing.id}
              listing={listing}
              rank={i + 4}
              isRecent={recentlyUpdated.has(listing.id)}
              onOutbid={onOutbid}
              onReport={onReport}
              isLast={i === rest.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
