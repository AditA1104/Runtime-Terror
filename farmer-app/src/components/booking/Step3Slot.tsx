import React from 'react';
import { SlotAvailable, DailyRatesCache } from '../../types/schema';
import { useTranslation } from '../../hooks/useTranslation';
import { formatTimeSlot, formatDate, formatINR } from '../../lib/utils';
import { Sparkles, Clock, Users, Check, AlertCircle } from 'lucide-react';

interface Step3SlotProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  availableSlots: SlotAvailable[];
  selectedSlotId: string;
  onSelectSlot: (slot: SlotAvailable) => void;
  dailyRates: DailyRatesCache[];
}

export const Step3Slot: React.FC<Step3SlotProps> = ({
  selectedDate,
  onSelectDate,
  availableSlots,
  selectedSlotId,
  onSelectSlot,
  dailyRates,
}) => {
  const { t } = useTranslation();

  // Find Best Day score from daily rates cache
  const bestDayItem = dailyRates.length > 0 
    ? [...dailyRates].sort((a, b) => b.best_day_score - a.best_day_score)[0]
    : null;

  // Filter slots for the selected date
  const filteredSlots = availableSlots.filter(s => s.slot_date === selectedDate);

  // Group unique dates
  const uniqueDates = Array.from(new Set(availableSlots.map(s => s.slot_date))).slice(0, 7);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* AI Smart Dispatch Recommendation Highlight */}
      {bestDayItem && (
        <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-green-500/15 border border-amber-300/80 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-900 uppercase tracking-wider text-[10px] bg-amber-100 px-2 py-0.5 rounded-full">
                  {t('best_day_badge')}
                </span>
                <strong className="text-slate-900 font-bold">
                  {formatDate(bestDayItem.forecast_date)}
                </strong>
              </div>
              <p className="text-slate-700 mt-1 font-medium leading-relaxed">
                {bestDayItem.reason_text} • Forecast Rate: <strong>{formatINR(bestDayItem.predicted_price)}/q</strong>
              </p>
              {selectedDate !== bestDayItem.forecast_date && (
                <button
                  onClick={() => onSelectDate(bestDayItem.forecast_date)}
                  className="mt-1.5 text-xs font-bold text-green-700 hover:text-green-800 hover:underline inline-flex items-center gap-1"
                >
                  ⚡ Select this recommended day →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Date Selector Row */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('select_date')}
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 overflow-x-auto pb-1">
          {uniqueDates.map(dateStr => {
            const isSelected = selectedDate === dateStr;
            const isRecommended = bestDayItem?.forecast_date === dateStr;
            const d = new Date(dateStr + 'T00:00:00');
            const dayName = new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(d);
            const dayNum = d.getDate();
            const monthName = new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(d);

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={`relative flex flex-col items-center py-2.5 px-2 rounded-2xl border transition-all text-center ${
                  isSelected
                    ? 'bg-green-700 text-white border-green-700 shadow-md shadow-green-700/25 scale-[1.02]'
                    : isRecommended
                    ? 'bg-amber-50/90 text-amber-950 border-amber-300 hover:bg-amber-100/60'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {isRecommended && !isSelected && (
                  <span className="absolute -top-2 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-sm">
                    ★ Best
                  </span>
                )}
                <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-green-100' : 'text-slate-400'}`}>
                  {dayName}
                </span>
                <span className="text-base font-extrabold mt-0.5">
                  {dayNum}
                </span>
                <span className={`text-[10px] ${isSelected ? 'text-green-100' : 'text-slate-500'}`}>
                  {monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Available Slots List */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('available_slots')} ({formatDate(selectedDate)})
        </label>

        {filteredSlots.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-6 text-center text-slate-500 text-xs border border-slate-200">
            <AlertCircle className="w-6 h-6 mx-auto text-slate-400 mb-2" />
            No open slots found for this date. Please select another day.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredSlots.map(slot => {
              const isSelected = selectedSlotId === slot.slot_id;
              const isFull = slot.remaining <= 0;
              const occupancyPct = Math.round(((slot.max_farmers - slot.remaining) / slot.max_farmers) * 100);

              return (
                <button
                  key={slot.slot_id}
                  disabled={isFull}
                  onClick={() => onSelectSlot(slot)}
                  className={`relative p-3.5 rounded-2xl border text-left transition-all ${
                    isFull
                      ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'border-green-600 bg-green-50/90 ring-2 ring-green-600/30 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${isSelected ? 'text-green-700' : 'text-slate-400'}`} />
                      <span className="font-bold text-sm text-slate-900">
                        {formatTimeSlot(slot.slot_start_time, slot.slot_end_time)}
                      </span>
                    </div>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-green-700 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : isFull ? (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        Full
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                        {slot.remaining} left
                      </span>
                    )}
                  </div>

                  {/* Slot Capacity Meter */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {slot.booked_count} of {slot.max_farmers} booked
                      </span>
                      <span>{occupancyPct}% full</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          occupancyPct > 80 ? 'bg-amber-500' : 'bg-green-600'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
