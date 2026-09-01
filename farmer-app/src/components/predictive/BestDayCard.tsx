import React from 'react';
import { DailyRatesCache } from '../../types/schema';
import { useTranslation } from '../../hooks/useTranslation';
import { formatDate, formatINR } from '../../lib/utils';
import { Sparkles, Calendar, TrendingUp, Users, ArrowRight, ShieldCheck } from 'lucide-react';

interface BestDayCardProps {
  rates: DailyRatesCache[];
  cropType: string;
  centerName: string;
  onBookBestDay: (date: string) => void;
}

export const BestDayCard: React.FC<BestDayCardProps> = ({
  rates,
  cropType,
  centerName,
  onBookBestDay,
}) => {
  const { t } = useTranslation();

  if (!rates || rates.length === 0) return null;

  // Best Day sorted by best_day_score descending
  const sorted = [...rates].sort((a, b) => b.best_day_score - a.best_day_score);
  const bestDay = sorted[0];

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-green-600/10 border-2 border-amber-300/80 rounded-3xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                {t('best_day_badge')}
              </span>
              <span className="text-xs font-bold text-slate-600">
                {cropType} @ {centerName}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              {formatDate(bestDay.forecast_date)}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Predicted Rate
          </span>
          <strong className="text-base sm:text-lg font-black text-green-800">
            {formatINR(bestDay.price_trend_score)} <span className="text-xs font-normal text-slate-500">/q</span>
          </strong>
        </div>
      </div>

      <div className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200/60 text-xs text-slate-700 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-amber-950">
          <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
          <span>{bestDay.reason_text}</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Our predictive dispatch engine scores booking load and commodity trends to prevent mandi yard bottlenecks and maximize your selling price.
        </p>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <ShieldCheck className="w-4 h-4 text-green-700" />
          <span>Govt MSP Protected</span>
        </div>

        <button
          onClick={() => onBookBestDay(bestDay.forecast_date)}
          className="px-4 py-2 bg-green-700 hover:bg-green-800 active:scale-95 text-white rounded-xl font-bold text-xs shadow-md shadow-green-700/20 transition-all flex items-center gap-1.5"
        >
          <span>Book for this Day</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
