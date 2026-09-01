import { Plus, Zap, Users, Eye, Radio, BookOpen } from 'lucide-react';
import { formatPaise, formatPaiseShort, formatCompact } from '@/lib/format';

interface Props {
  totalCollected: number;
  numListings: number;
  topBid: number;
  onlineCount: number;
  totalVisits: number;
  onBidClick: () => void;
  onRulesClick: () => void;
}

export function Header({
  totalCollected,
  numListings,
  topBid,
  onlineCount,
  totalVisits,
  onBidClick,
  onRulesClick,
}: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-stone-100/80 backdrop-blur-xl">
      <div className="mx-auto max-w-2xl px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white">
              <Zap className="h-4 w-4 fill-white" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <h1 className="font-display text-lg font-bold tracking-tight text-stone-900 sm:text-xl">
                BidMySocial
              </h1>
              <span className="text-[10px] font-semibold text-stone-400">.in</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRulesClick}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600 transition-all hover:border-stone-300 hover:bg-stone-50 sm:text-sm"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Rules</span>
            </button>
            <button
              onClick={onBidClick}
              className="flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-stone-700 hover:shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Add listing</span>
              <span className="sm:hidden">Bid</span>
            </button>
          </div>
        </div>

        {/* Stats strip — right next to logo area, below */}
        <div className="flex items-center gap-3.5 pb-2.5 text-xs sm:gap-5 sm:text-sm">
          {/* Online */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-bold tabular-nums text-stone-900">{formatCompact(onlineCount)}</span>
            <span className="text-stone-400">online</span>
          </div>

          <div className="h-3 w-px bg-stone-300" />

          {/* Visits */}
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-stone-500" />
            <span className="font-bold tabular-nums text-stone-900">{formatCompact(totalVisits)}</span>
            <span className="text-stone-400">visited</span>
          </div>

          <div className="h-3 w-px bg-stone-300" />

          {/* Total bids */}
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-stone-500" />
            <span className="font-bold tabular-nums text-stone-900">{numListings}</span>
            <span className="text-stone-400">creators</span>
          </div>

          <div className="h-3 w-px bg-stone-300" />

          {/* #1 bid */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold tabular-nums text-orange-600">{formatPaiseShort(topBid)}</span>
            <span className="text-stone-400">#1</span>
          </div>
        </div>
      </div>
    </header>
  );
}
