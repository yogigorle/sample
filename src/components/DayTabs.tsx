import { Calendar } from 'lucide-react';
import type { BoardMode } from '@/types';
import { formatDateLabel } from '@/lib/format';

interface Props {
  mode: BoardMode;
  selectedDate: string | null;
  availableDates: string[];
  onModeChange: (mode: BoardMode) => void;
  onDateChange: (date: string) => void;
}

export function DayTabs({ mode, selectedDate, availableDates, onModeChange, onDateChange }: Props) {
  return (
    <div className="mb-4">
      {/* Mode toggle */}
      <div className="mb-3 inline-flex rounded-lg border border-stone-200 bg-white p-0.5">
        <button
          onClick={() => onModeChange('all-time')}
          className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
            mode === 'all-time'
              ? 'bg-stone-900 text-white'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          All-time
        </button>
        <button
          onClick={() => onModeChange('daily')}
          className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
            mode === 'daily'
              ? 'bg-stone-900 text-white'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Daily
        </button>
      </div>

      {/* Date pills — only in daily mode */}
      {mode === 'daily' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-stone-400" />
          {availableDates.length === 0 ? (
            <p className="text-xs text-stone-400">No daily boards yet.</p>
          ) : (
            availableDates.map((date) => (
              <button
                key={date}
                onClick={() => onDateChange(date)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedDate === date
                    ? 'bg-stone-900 text-white'
                    : 'border border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                {formatDateLabel(date)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
