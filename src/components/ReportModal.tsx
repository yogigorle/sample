import { useState } from 'react';
import { X, Flag, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { Listing, ReportReason } from '@/types';
import { supabase } from '@/lib/supabase';
import { getFingerprint } from '@/lib/format';

interface Props {
  open: boolean;
  onClose: () => void;
  listing: Listing | null;
}

const reasons: { value: ReportReason; label: string; desc: string }[] = [
  { value: 'spam', label: 'Spam', desc: 'Irrelevant or repetitive content' },
  { value: 'fake', label: 'Fake handle', desc: 'Not a real creator account' },
  { value: 'inappropriate', label: 'Inappropriate', desc: 'Offensive or misleading' },
  { value: 'other', label: 'Other', desc: 'Something else' },
];

export function ReportModal({ open, onClose, listing }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [stage, setStage] = useState<'form' | 'submitting' | 'done' | 'error'>('form');
  const [errorMsg, setErrorMsg] = useState('');

  if (!open || !listing) return null;

  function handleClose() {
    if (stage === 'submitting') return;
    setReason(null);
    setStage('form');
    setErrorMsg('');
    onClose();
  }

  async function handleSubmit() {
    if (!reason || !listing) return;
    setStage('submitting');
    setErrorMsg('');

    try {
      const { error } = await supabase.from('reports').insert({
        listing_id: listing.id,
        reason,
        reporter_fingerprint: getFingerprint(),
      });

      if (error) throw error;
      setStage('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setErrorMsg(msg);
      setStage('error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-md" onClick={handleClose} />

      <div className="relative w-full max-w-sm animate-slide-up rounded-t-3xl border border-stone-200 bg-white shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Flag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-stone-900">Report</h2>
              <p className="text-xs text-stone-500">@{listing.handle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={stage === 'submitting'}
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        {stage === 'form' && (
          <div className="space-y-3 px-5 py-5 sm:px-6">
            <p className="text-xs text-stone-500">Why are you reporting this listing?</p>
            {reasons.map((r) => (
              <button
                key={r.value}
                onClick={() => setReason(r.value)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${
                  reason === r.value
                    ? 'border-red-400 bg-red-50'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  reason === r.value ? 'border-red-500 bg-red-500' : 'border-stone-300'
                }`}>
                  {reason === r.value && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">{r.label}</p>
                  <p className="text-xs text-stone-400">{r.desc}</p>
                </div>
              </button>
            ))}

            <button
              onClick={handleSubmit}
              disabled={!reason}
              className="mt-2 w-full rounded-xl bg-red-500 py-3.5 text-sm font-bold text-white transition-all hover:bg-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit report
            </button>
          </div>
        )}

        {/* Submitting */}
        {stage === 'submitting' && (
          <div className="flex flex-col items-center justify-center gap-3 py-14">
            <Loader2 className="h-7 w-7 animate-spin text-stone-400" />
            <p className="text-sm text-stone-500">Submitting...</p>
          </div>
        )}

        {/* Done */}
        {stage === 'done' && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 ring-4 ring-emerald-100">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <p className="font-display text-base font-bold text-stone-900">Report submitted</p>
              <p className="mt-1 text-xs text-stone-500">Thank you. We'll review this listing.</p>
            </div>
            <button
              onClick={handleClose}
              className="mt-2 w-full rounded-xl border border-stone-200 bg-white py-3 text-sm font-bold text-stone-900 transition-colors hover:bg-stone-50"
            >
              Close
            </button>
          </div>
        )}

        {/* Error */}
        {stage === 'error' && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 ring-4 ring-red-100">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <p className="font-display text-base font-bold text-stone-900">Something went wrong</p>
              <p className="mt-1 text-xs text-stone-500">{errorMsg}</p>
            </div>
            <button
              onClick={() => setStage('form')}
              className="mt-2 w-full rounded-xl bg-stone-900 py-3 text-sm font-bold text-white transition-colors hover:bg-stone-700"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
