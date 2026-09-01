import { useState } from 'react';
import { Plus, Zap } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { useSiteStats } from '@/hooks/useSiteStats';
import { useAvailableDates } from '@/hooks/useAvailableDates';
import type { Listing, BoardMode } from '@/types';
import { Header } from '@/components/Header';
import { Leaderboard } from '@/components/Leaderboard';
import { BidModal } from '@/components/BidModal';
import { RulesModal } from '@/components/RulesModal';
import { ReportModal } from '@/components/ReportModal';
import { DayTabs } from '@/components/DayTabs';

export default function App() {
  const [mode, setMode] = useState<BoardMode>('all-time');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const availableDates = useAvailableDates();
  const { listings, loading, recentlyUpdated } = useListings(mode, selectedDate);
  const { onlineCount, totalVisits } = useSiteStats();

  const [modalOpen, setModalOpen] = useState(false);
  const [outbidTarget, setOutbidTarget] = useState<Listing | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<Listing | null>(null);

  const topBid = listings.length > 0 ? listings[0].current_bid : 0;
  const totalCollected = listings.reduce((sum, l) => sum + l.current_bid, 0);

  function openNewBid() {
    setOutbidTarget(null);
    setModalOpen(true);
  }

  function openOutbid(listing: Listing) {
    setOutbidTarget(listing);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setOutbidTarget(null);
  }

  function openReport(listing: Listing) {
    setReportTarget(listing);
  }

  function closeReport() {
    setReportTarget(null);
  }

  function handleModeChange(newMode: BoardMode) {
    setMode(newMode);
    if (newMode === 'daily' && availableDates.length > 0) {
      setSelectedDate(availableDates[0]);
    } else {
      setSelectedDate(null);
    }
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <Header
        totalCollected={totalCollected}
        numListings={listings.length}
        topBid={topBid}
        onlineCount={onlineCount}
        totalVisits={totalVisits}
        onBidClick={openNewBid}
        onRulesClick={() => setRulesOpen(true)}
      />

      <main className="mx-auto max-w-2xl px-4 pb-24 pt-4 sm:pt-6">
        {/* Hero tagline */}
        <div className="mb-4 px-1">
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-stone-900 sm:text-3xl">
            Pay to rank your{' '}
            <span className="text-fuchsia-600">Instagram</span>{' '}
            or <span className="text-red-600">YouTube</span>
          </h2>
          <p className="mt-1.5 text-sm text-stone-500 sm:text-base">
            Highest bid takes #1. Outbid anyone, anytime. It's a live auction for attention.
          </p>
        </div>

        {/* Day tabs */}
        <DayTabs
          mode={mode}
          selectedDate={selectedDate}
          availableDates={availableDates}
          onModeChange={handleModeChange}
          onDateChange={setSelectedDate}
        />

        <Leaderboard
          listings={listings}
          loading={loading}
          recentlyUpdated={recentlyUpdated}
          onOutbid={openOutbid}
          onReport={openReport}
        />

        {/* How it works */}
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white/60 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-bold text-stone-900">How it works</h3>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              { step: '1', title: 'Submit & bid', desc: 'Enter your handle and place a bid in ₹.' },
              { step: '2', title: 'Highest wins #1', desc: 'Board sorts by bid. Top 3 get the podium.' },
              { step: '3', title: 'Outbid to climb', desc: 'Anyone can pay more to push you down.' },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-stone-200/60 bg-white p-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-stone-900 text-xs font-bold text-white">
                  {item.step}
                </div>
                <h4 className="mt-2 text-sm font-bold text-stone-900">{item.title}</h4>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-stone-200 bg-stone-100/90 px-4 py-3 backdrop-blur-xl sm:hidden">
        <button
          onClick={openNewBid}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add your listing
        </button>
      </div>

      <BidModal
        open={modalOpen}
        onClose={closeModal}
        target={outbidTarget}
        topBidPaise={topBid}
      />

      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />

      <ReportModal
        open={reportTarget !== null}
        onClose={closeReport}
        listing={reportTarget}
      />
    </div>
  );
}
