import React from 'react';
import { DailyRatesCache } from '../../types/schema';
import { formatDate, formatINR } from '../../lib/utils';
import { TrendingUp, Users, Sparkles, Award } from 'lucide-react';

interface PriceTrendChartProps {
  rates: DailyRatesCache[];
  onSelectDate?: (date: string) => void;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ rates, onSelectDate }) => {
  if (!rates || rates.length === 0) return null;

  const maxPrice = Math.max(...rates.map(r => r.price_trend_score));
  const minPrice = Math.min(...rates.map(r => r.price_trend_score));
  const bestDay = [...rates].sort((a, b) => b.best_day_score - a.best_day_score)[0];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-green-700" />
            7-Day Mandi Price & Rush Forecast
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Predictive AI model balances expected market rate against mandi arrival queues.
          </p>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="pt-4 pb-2">
        <div className="grid grid-cols-7 gap-2 items-end h-40">
          {rates.slice(0, 7).map(item => {
            const isBest = item.forecast_date === bestDay.forecast_date;
            const priceRange = maxPrice - minPrice || 1;
            const heightPercent = Math.max(30, Math.min(100, Math.round(((item.price_trend_score - minPrice) / priceRange) * 70 + 30)));
            const d = new Date(item.forecast_date + 'T00:00:00');
            const dayName = new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(d);

            return (
              <div
                key={item.forecast_date}
                onClick={() => onSelectDate && onSelectDate(item.forecast_date)}
                className={`group relative flex flex-col items-center h-full justify-end cursor-pointer transition-all ${
                  onSelectDate ? 'hover:scale-105' : ''
                }`}
              >
                {/* Tooltip on Hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-md">
                  {formatINR(item.price_trend_score)} • Score: {item.best_day_score}/100
                </div>

                {isBest && (
                  <span className="absolute -top-6 text-amber-500 font-extrabold text-[11px] animate-bounce">
                    ★ Best
                  </span>
                )}

                {/* The Bar */}
                <div
                  className={`w-full rounded-t-xl transition-all duration-500 relative flex items-start justify-center pt-1.5 ${
                    isBest
                      ? 'bg-gradient-to-t from-amber-500 to-amber-400 shadow-md shadow-amber-500/30 ring-2 ring-amber-300'
                      : 'bg-gradient-to-t from-green-700 to-emerald-500 hover:brightness-110'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                >
                  <span className="text-[9px] font-black text-white px-0.5 truncate">
                    ₹{item.price_trend_score}
                  </span>
                </div>

                {/* Day Label */}
                <div className="mt-2 text-center">
                  <span className={`text-[10px] font-bold block ${isBest ? 'text-amber-800' : 'text-slate-600'}`}>
                    {dayName}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {d.getDate()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scoring Formula Legend */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-slate-600 text-[11px]">
            <strong>AI Dispatch Formula:</strong> Score = Price Trend − Booking Congestion Penalty
          </span>
        </div>
        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
          Live Scored
        </span>
      </div>
    </div>
  );
};
