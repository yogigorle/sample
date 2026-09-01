import { X, BookOpen } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const rules = [
  {
    title: 'Minimum bid',
    desc: 'New listings start at ₹49. To outbid the current #1, you must pay at least ₹5 more than their current bid.',
  },
  {
    title: 'Ranking',
    desc: 'The board sorts purely by bid amount — highest first. Ties are broken by earliest listing time.',
  },
  {
    title: 'Outbid anytime',
    desc: 'Anyone can pay more to push you down. Reclaim your spot by bidding again — no limits.',
  },
  {
    title: 'Daily boards',
    desc: 'Switch to Daily mode to see rankings for a specific day. All-time mode shows the full history.',
  },
  {
    title: 'Reporting',
    desc: 'See a spam or fake handle? Use the red flag button to report it. Multiple reports flag listings for review.',
  },
  {
    title: 'Payments',
    desc: 'Bids are in Indian Rupees (₹), processed via Razorpay. No refunds — your bid is a commitment.',
  },
];

export function RulesModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-md" onClick={onClose} />

      <div className="relative max-h-[85vh] w-full max-w-md animate-slide-up overflow-y-auto rounded-t-3xl border border-stone-200 bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-white">
              <BookOpen className="h-4 w-4" />
            </div>
            <h2 className="font-display text-base font-bold text-stone-900 sm:text-lg">Rules</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          {rules.map((rule, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-xs font-bold text-stone-600">
                {i + 1}
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">{rule.title}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-500">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
