import { useEffect, useMemo, useState } from 'react';
import { X, Instagram, Youtube, CheckCircle2, Loader2, AlertCircle, ArrowUpRight, Crown, Sparkles, Check } from 'lucide-react';
import type { Listing, Platform } from '@/types';
import { supabase } from '@/lib/supabase';
import { cleanHandle, buildProfileUrl, formatPaise, isValidHandle } from '@/lib/format';

interface Props {
  open: boolean;
  onClose: () => void;
  target: Listing | null;
  topBidPaise: number;
}

type Stage = 'form' | 'paying' | 'success' | 'error';

const MIN_NEW_BID_PAISE = 4900;
const OUTBID_INCREMENT_PAISE = 500;

export function BidModal({ open, onClose, target, topBidPaise }: Props) {
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [handle, setHandle] = useState('');
  const [bidRupees, setBidRupees] = useState('');
  const [stage, setStage] = useState<Stage>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [completedListing, setCompletedListing] = useState<Listing | null>(null);
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [handleValid, setHandleValid] = useState<boolean | null>(null);

  const isOutbid = target !== null;
  const cleanedHandle = cleanHandle(handle);

  const minBidPaise = useMemo(() => {
    if (isOutbid) return target.current_bid + OUTBID_INCREMENT_PAISE;
    return Math.max(MIN_NEW_BID_PAISE, topBidPaise + OUTBID_INCREMENT_PAISE);
  }, [isOutbid, target, topBidPaise]);

  const minBidRupees = minBidPaise / 100;

  useEffect(() => {
    if (!open) return;
    setStage('form');
    setErrorMsg('');
    setCompletedListing(null);
    setHandleValid(null);
    if (target) {
      setPlatform(target.platform);
      setHandle(target.handle);
      setBidRupees(String((target.current_bid + OUTBID_INCREMENT_PAISE) / 100));
      setHandleValid(true);
    } else {
      setPlatform('instagram');
      setHandle('');
      setBidRupees(String(Math.max(MIN_NEW_BID_PAISE, topBidPaise + OUTBID_INCREMENT_PAISE) / 100));
    }
  }, [open, target, topBidPaise]);

  // Debounced handle validation
  useEffect(() => {
    if (!open || isOutbid) return;
    if (!cleanedHandle) {
      setHandleValid(null);
      return;
    }

    setCheckingHandle(true);
    const timer = setTimeout(() => {
      const valid = isValidHandle(platform, cleanedHandle);
      setHandleValid(valid);
      setCheckingHandle(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [cleanedHandle, platform, open, isOutbid]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stage !== 'paying') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, stage, onClose]);

  if (!open) return null;

  const bidPaise = Math.round((parseFloat(bidRupees) || 0) * 100);

  const validation: string | null = (() => {
    if (!isOutbid) {
      if (!cleanedHandle) return 'Enter your handle';
      if (!isValidHandle(platform, cleanedHandle)) {
        return platform === 'instagram'
          ? 'Invalid Instagram handle (1-30 chars, letters, numbers, dots, underscores)'
          : 'Invalid YouTube handle (3-30 chars, letters, numbers, hyphens, underscores)';
      }
    }
    if (!bidRupees.trim() || isNaN(parseFloat(bidRupees))) return 'Enter a bid amount';
    if (bidPaise < minBidPaise) return `Minimum bid is ${formatPaise(minBidPaise)}`;
    return null;
  })();

  async function handleProceedToPay() {
    if (validation) return;
    setStage('paying');
    setErrorMsg('');

    const h = cleanHandle(handle);
    const url = buildProfileUrl(platform, h);
    const name = h;

    // TODO: Wire up Razorpay here. This stub simulates a successful payment
    // after a short delay. Replace with the real Razorpay checkout handler.
    await new Promise((r) => setTimeout(r, 1400));

    try {
      const { data: upserted, error: upsertError } = await supabase
        .from('listings')
        .upsert(
          {
            handle: h,
            platform,
            display_name: name,
            profile_url: url,
            current_bid: bidPaise,
            last_bid_at: new Date().toISOString(),
            bid_date: new Date().toISOString().slice(0, 10),
          },
          { onConflict: 'handle,platform' },
        )
        .select()
        .maybeSingle();

      if (upsertError) throw upsertError;

      // Record the bid in bids table
      if (upserted) {
        await supabase.from('bids').insert({
          listing_id: upserted.id,
          amount_paise: bidPaise,
        });
      }

      setCompletedListing((upserted ?? null) as Listing | null);
      setStage('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setErrorMsg(msg);
      setStage('error');
    }
  }

  function handleClose() {
    if (stage === 'paying') return;
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-md" onClick={handleClose} />

      <div className="relative max-h-[90vh] w-full max-w-md animate-slide-up overflow-y-auto rounded-t-3xl border border-stone-200 bg-white shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isOutbid ? 'bg-orange-100 text-orange-600' : 'bg-stone-900 text-white'
            }`}>
              {isOutbid ? <Crown className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-stone-900 sm:text-lg">
                {isOutbid ? 'Outbid' : 'Add your listing'}
              </h2>
              <p className="text-xs text-stone-500">
                {isOutbid
                  ? `Beat ${target.display_name}'s ${formatPaise(target.current_bid)}`
                  : 'Pay to rank on the leaderboard'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={stage === 'paying'}
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* === FORM STAGE === */}
        {stage === 'form' && (
          <div className="space-y-4 px-5 py-5 sm:px-6">
            {/* Platform toggle */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-stone-400">
                Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['instagram', 'youtube'] as Platform[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    disabled={isOutbid}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all ${
                      platform === p
                        ? p === 'instagram'
                          ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-600 shadow-sm'
                          : 'border-red-500 bg-red-50 text-red-600 shadow-sm'
                        : 'border-stone-200 bg-white text-stone-400 hover:border-stone-300 hover:bg-stone-50'
                    } ${isOutbid ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {p === 'instagram' ? <Instagram className="h-4 w-4" /> : <Youtube className="h-4 w-4" />}
                    {p === 'instagram' ? 'Instagram' : 'YouTube'}
                  </button>
                ))}
              </div>
            </div>

            {/* Handle with live validation */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-400">
                Handle
              </label>
              <div className={`flex items-center rounded-xl border bg-stone-50 transition-colors focus-within:bg-white ${
                handleValid === false ? 'border-red-300 focus-within:border-red-400'
                : handleValid === true ? 'border-emerald-300 focus-within:border-emerald-400'
                : 'border-stone-200 focus-within:border-stone-400'
              }`}>
                <span className="pl-3.5 text-stone-400">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  disabled={isOutbid}
                  placeholder={platform === 'instagram' ? 'yourhandle' : 'yourchannel'}
                  className="w-full bg-transparent px-1.5 py-3 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none disabled:opacity-50"
                />
                {/* Validation indicator */}
                {checkingHandle && (
                  <Loader2 className="mr-3 h-4 w-4 animate-spin text-stone-300" />
                )}
                {!checkingHandle && handleValid === true && (
                  <Check className="mr-3 h-4 w-4 text-emerald-500" />
                )}
                {!checkingHandle && handleValid === false && !isOutbid && (
                  <AlertCircle className="mr-3 h-4 w-4 text-red-400" />
                )}
              </div>
              {!isOutbid && (
                <p className="mt-1.5 text-xs text-stone-400">
                  {platform === 'instagram'
                    ? 'Instagram: letters, numbers, dots, underscores (max 30)'
                    : 'YouTube: letters, numbers, hyphens, underscores (3-30)'}
                </p>
              )}
            </div>

            {/* Bid amount */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-400">
                Bid Amount
              </label>
              <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 focus-within:border-stone-400 focus-within:bg-white">
                <span className="pl-3.5 font-bold text-stone-400">₹</span>
                <input
                  type="number"
                  value={bidRupees}
                  onChange={(e) => setBidRupees(e.target.value)}
                  min={minBidRupees}
                  step="1"
                  className="w-full bg-transparent px-2 py-3 text-base font-bold text-stone-900 placeholder:text-stone-300 focus:outline-none"
                />
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-400">
                <span className={`h-1.5 w-1.5 rounded-full ${bidPaise >= minBidPaise ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                <span>
                  {isOutbid
                    ? `Min to outbid: ${formatPaise(minBidPaise)}`
                    : `Min bid: ${formatPaise(minBidPaise)}`}
                </span>
              </div>
            </div>

            {/* Validation hint */}
            {validation && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {validation}
              </div>
            )}

            {/* Pay button */}
            <button
              onClick={handleProceedToPay}
              disabled={validation !== null}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-stone-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              {isOutbid ? 'Outbid' : 'Place bid'}{bidRupees && !validation ? ` ${formatPaise(bidPaise)}` : ''}
            </button>

            <p className="text-center text-[11px] text-stone-400">
              TODO: Razorpay checkout — demo mode, no charge
            </p>
          </div>
        )}

        {/* === PAYING STAGE === */}
        {stage === 'paying' && (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
            <p className="text-sm font-medium text-stone-600">Processing payment...</p>
          </div>
        )}

        {/* === SUCCESS STAGE === */}
        {stage === 'success' && (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 ring-4 ring-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-stone-900">You're on the board!</p>
              <p className="mt-1 text-sm text-stone-500">
                {completedListing
                  ? `@${completedListing.handle} bid ${formatPaise(completedListing.current_bid)}`
                  : 'Your bid is live'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 w-full rounded-xl border border-stone-200 bg-white py-3.5 text-sm font-bold text-stone-900 transition-colors hover:bg-stone-50"
            >
              View leaderboard
            </button>
          </div>
        )}

        {/* === ERROR STAGE === */}
        {stage === 'error' && (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 ring-4 ring-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-stone-900">Payment failed</p>
              <p className="mt-1 text-sm text-stone-500">{errorMsg || 'Please try again.'}</p>
            </div>
            <button
              onClick={() => setStage('form')}
              className="mt-2 w-full rounded-xl bg-stone-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-stone-700"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
