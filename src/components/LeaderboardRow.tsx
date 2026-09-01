import { ArrowUpRight, ExternalLink, Flag } from 'lucide-react';
import type { Listing } from '@/types';
import { PlatformIcon } from './PlatformIcon';
import { formatPaise, timeAgo } from '@/lib/format';

interface Props {
  listing: Listing;
  rank: number;
  isRecent: boolean;
  isLast?: boolean;
  onOutbid: (listing: Listing) => void;
  onReport: (listing: Listing) => void;
}

export function LeaderboardRow({ listing, rank, isRecent, isLast, onOutbid, onReport }: Props) {
  return (
    <div
      className={`group relative flex items-center gap-3 px-3.5 py-3 transition-colors sm:gap-4 sm:px-4 sm:py-3.5 ${
        !isLast ? 'border-b border-stone-100' : ''
      } ${isRecent ? 'animate-flash-row' : 'hover:bg-stone-50'}`}
    >
      {/* Rank */}
      <div className="flex w-6 shrink-0 items-center justify-center sm:w-7">
        <span className="text-sm font-bold tabular-nums text-stone-400 sm:text-base">
          {rank}
        </span>
      </div>

      {/* Platform icon */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${
          listing.platform === 'instagram'
            ? 'bg-fuchsia-50 text-fuchsia-600'
            : 'bg-red-50 text-red-600'
        }`}
      >
        <PlatformIcon platform={listing.platform} className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
      </div>

      {/* Name + handle */}
      <div className="min-w-0 flex-1">
        <a
          href={listing.profile_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm font-semibold text-stone-900 hover:text-orange-600 sm:text-[15px]"
        >
          <span className="truncate">{listing.display_name}</span>
          <ExternalLink className="h-3 w-3 shrink-0 text-stone-300" />
        </a>
        <p className="truncate text-xs text-stone-400">@{listing.handle}</p>
      </div>

      {/* Time ago (desktop only) */}
      <span className="hidden shrink-0 text-xs text-stone-400 lg:block">
        {timeAgo(listing.last_bid_at)}
      </span>

      {/* Bid amount */}
      <span className="shrink-0 text-base font-bold tabular-nums tracking-tight text-stone-900 sm:text-lg">
        {formatPaise(listing.current_bid)}
      </span>

      {/* Outbid button */}
      <button
        onClick={() => onOutbid(listing)}
        className="flex shrink-0 items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-bold text-stone-600 transition-all hover:border-stone-900 hover:bg-stone-900 hover:text-white active:scale-95 sm:px-3 sm:py-2"
      >
        <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />
        <span className="hidden sm:inline">Outbid</span>
      </button>

      {/* Report flag — appears on hover */}
      <button
        onClick={() => onReport(listing)}
        title="Report this listing"
        className="flex shrink-0 items-center justify-center rounded-lg p-1.5 text-stone-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
      >
        <Flag className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
