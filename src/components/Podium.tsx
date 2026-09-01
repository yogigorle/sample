import { Crown, ExternalLink, ArrowUpRight } from 'lucide-react';
import type { Listing } from '@/types';
import { PlatformIcon } from './PlatformIcon';
import { formatPaise, timeAgo } from '@/lib/format';

interface Props {
  listings: Listing[];
  onOutbid: (listing: Listing) => void;
}

export function Podium({ listings, onOutbid }: Props) {
  if (listings.length === 0) return null;

  const [first, second, third] = listings;
  const hasSecond = !!second;
  const hasThird = !!third;

  return (
    <div className="mb-4">
      {/* Podium visual — 2nd, 1st, 3rd order */}
      <div className="flex items-end justify-center gap-2 sm:gap-4">
        {/* 2nd place */}
        <div className="flex flex-1 flex-col items-center">
          {hasSecond && (
            <PodiumCard listing={second} rank={2} onOutbid={onOutbid} />
          )}
          <PodiumBar rank={2} />
        </div>

        {/* 1st place — tallest */}
        <div className="flex flex-1 flex-col items-center">
          {first && (
            <PodiumCard listing={first} rank={1} onOutbid={onOutbid} featured />
          )}
          <PodiumBar rank={1} />
        </div>

        {/* 3rd place */}
        <div className="flex flex-1 flex-col items-center">
          {hasThird && (
            <PodiumCard listing={third} rank={3} onOutbid={onOutbid} />
          )}
          <PodiumBar rank={3} />
        </div>
      </div>
    </div>
  );
}

function PodiumCard({
  listing,
  rank,
  onOutbid,
  featured,
}: {
  listing: Listing;
  rank: number;
  onOutbid: (l: Listing) => void;
  featured?: boolean;
}) {
  const isInstagram = listing.platform === 'instagram';
  const medalColors = {
    1: 'from-amber-400 to-orange-500',
    2: 'from-stone-300 to-stone-400',
    3: 'from-orange-300 to-amber-400',
  };
  const barColors = {
    1: 'bg-gradient-to-t from-amber-200 to-amber-100',
    2: 'bg-gradient-to-t from-stone-200 to-stone-100',
    3: 'bg-gradient-to-t from-orange-200 to-amber-100',
  };
  const heights = { 1: 'h-16 sm:h-20', 2: 'h-12 sm:h-14', 3: 'h-9 sm:h-10' };

  return (
    <>
      <div
        className={`relative w-full overflow-hidden rounded-2xl border bg-white p-3 shadow-sm transition-all hover:shadow-md sm:p-4 ${
          featured
            ? 'border-amber-300 ring-2 ring-amber-200/50'
            : 'border-stone-200'
        }`}
      >
        {/* Rank badge */}
        <div className="absolute right-2 top-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${medalColors[rank as 1 | 2 | 3]} text-white shadow-sm sm:h-7 sm:w-7`}>
            {rank === 1 ? (
              <Crown className="h-3 w-3 fill-white/30 sm:h-4 sm:w-4" />
            ) : (
              <span className="text-xs font-black">{rank}</span>
            )}
          </div>
        </div>

        {/* Platform icon */}
        <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${
          isInstagram ? 'bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white' : 'bg-gradient-to-br from-red-500 to-rose-600 text-white'
        }`}>
          <PlatformIcon platform={listing.platform} className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>

        {/* Name */}
        <a
          href={listing.profile_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-bold text-stone-900 hover:text-orange-600 sm:text-sm"
        >
          <span className="truncate">{listing.display_name}</span>
          <ExternalLink className="h-3 w-3 shrink-0 text-stone-300" />
        </a>
        <p className="truncate text-[10px] text-stone-400 sm:text-xs">@{listing.handle}</p>

        {/* Bid */}
        <p className={`mt-1.5 font-display text-base font-bold tabular-nums tracking-tight sm:text-lg ${
          featured ? 'text-orange-600' : 'text-stone-900'
        }`}>
          {formatPaise(listing.current_bid)}
        </p>
        <p className="text-[10px] text-stone-400">{timeAgo(listing.last_bid_at)}</p>

        {/* Outbid */}
        <button
          onClick={() => onOutbid(listing)}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-stone-900 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-stone-700 active:scale-95 sm:text-xs"
        >
          <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
          Outbid
        </button>
      </div>

      <div className={`w-full rounded-b-xl ${barColors[rank as 1 | 2 | 3]} ${heights[rank as 1 | 2 | 3]}`} />
    </>
  );
}

function PodiumBar({ rank }: { rank: number }) {
  const heights = { 1: 'h-16 sm:h-20', 2: 'h-12 sm:h-14', 3: 'h-9 sm:h-10' };
  const colors = {
    1: 'bg-gradient-to-t from-amber-200 to-amber-100',
    2: 'bg-gradient-to-t from-stone-200 to-stone-100',
    3: 'bg-gradient-to-t from-orange-200 to-amber-100',
  };
  return <div className={`w-full rounded-b-xl ${colors[rank as 1 | 2 | 3]} ${heights[rank as 1 | 2 | 3]}`} />;
}
