import React, { useState } from 'react';
import { MandiCenter, SlotAvailable, Farmer } from '../../types/schema';
import { CROPS_DATA } from '../../lib/mockData';
import { useTranslation } from '../../hooks/useTranslation';
import { getLocalizedMandiName } from '../../lib/translations';
import { formatINR, formatTimeSlot, formatDate, quintalToKg } from '../../lib/utils';
import { Calendar, Clock, MapPin, Scale, IndianRupee, QrCode, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Step4ConfirmProps {
  cropId: string;
  center: MandiCenter;
  slot: SlotAvailable;
  farmer: Farmer | null;
  onConfirmBooking: (quantityKg: number) => Promise<void>;
  isSubmitting: boolean;
}

export const Step4Confirm: React.FC<Step4ConfirmProps> = ({
  cropId,
  center,
  slot,
  farmer,
  onConfirmBooking,
  isSubmitting,
}) => {
  const { t, lang } = useTranslation();
  const [unit, setUnit] = useState<'quintal' | 'kg'>('kg');
  const [quantity, setQuantity] = useState<number>(2500); // Default 2,500 kg (25 quintals)

  const crop = CROPS_DATA.find(c => c.id === cropId) || CROPS_DATA[0];
  const quantityKg = unit === 'quintal' ? quintalToKg(quantity) : quantity;
  const quantityQuintals = unit === 'quintal' ? quantity : quantity / 100;
  const estimatedPayout = Math.round(quantityQuintals * crop.mspPrice);
  const localizedCenterName = getLocalizedMandiName(center.center_name, lang);

  const handleUnitToggle = (newUnit: 'quintal' | 'kg') => {
    if (newUnit === unit) return;
    if (newUnit === 'quintal') {
      setQuantity(Math.max(1, Math.round(quantity / 100)));
    } else {
      setQuantity(quantity * 100);
    }
    setUnit(newUnit);
  };

  const kgPresets = [500, 1000, 2500, 5000, 10000];
  const quintalPresets = [5, 10, 25, 50, 100];

  const handleSubmit = async () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#15803d', '#22c55e', '#eab308', '#f59e0b'],
      });
    } catch (e) {
      // safe fallback
    }
    await onConfirmBooking(quantityKg);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Booking Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-green-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-green-500/10 rounded-full blur-3xl" />
        
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-green-400">
              {t('procurement_summary')}
            </span>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mt-0.5">
              <span>{crop.icon}</span>
              <span>{t(crop.nameKey, crop.id)}</span>
            </h3>
          </div>
          <span className="text-xs font-extrabold bg-green-500/20 text-green-300 px-2.5 py-1 rounded-full border border-green-400/30">
            {formatINR(crop.mspPrice)} /q
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 py-3 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3 text-green-400" /> {t('apmc_center_label')}
            </span>
            <strong className="text-slate-100 font-semibold block truncate">
              {localizedCenterName}
            </strong>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
              <Calendar className="w-3 h-3 text-green-400" /> {t('selling_date_label')}
            </span>
            <strong className="text-slate-100 font-semibold block">
              {formatDate(slot.slot_date)}
            </strong>
          </div>

          <div className="space-y-1 col-span-2">
            <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
              <Clock className="w-3 h-3 text-green-400" /> {t('assigned_gate_slot')}
            </span>
            <strong className="text-amber-300 font-bold block text-sm">
              {formatTimeSlot(slot.slot_start_time, slot.slot_end_time)}
            </strong>
          </div>
        </div>

        {/* Farmer Info */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <span>{t('farmer_label')} <strong>{farmer?.full_name || 'Ramesh Patil'}</strong></span>
          <span className="text-slate-400">+91 {farmer?.phone_number || '9876543210'}</span>
        </div>
      </div>

      {/* Quantity Input Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-green-700" />
            {t('est_quantity')}
          </label>
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleUnitToggle('kg')}
              className={`px-3 py-1 rounded-md transition-all ${
                unit === 'kg' ? 'bg-white text-green-800 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              {t('unit_kg')}
            </button>
            <button
              type="button"
              onClick={() => handleUnitToggle('quintal')}
              className={`px-3 py-1 rounded-md transition-all ${
                unit === 'quintal' ? 'bg-white text-green-800 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              {t('unit_quintal')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={100000}
            value={quantity}
            onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-full text-xl font-black px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-green-600 focus:outline-none font-mono"
          />
          <div className="shrink-0 text-xs font-bold text-slate-600 text-right">
            {unit === 'kg' ? (
              <>
                <span className="block text-slate-900 text-sm font-black">{quantity.toLocaleString('en-IN')} kg</span>
                <span className="text-slate-400">({(quantity / 100).toFixed(1)} q)</span>
              </>
            ) : (
              <>
                <span className="block text-slate-900 text-sm font-black">{quantity} q</span>
                <span className="text-slate-400">({(quantity * 100).toLocaleString('en-IN')} kg)</span>
              </>
            )}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 mr-1">{t('quick_presets')}</span>
          {(unit === 'kg' ? kgPresets : quintalPresets).map(presetVal => (
            <button
              key={presetVal}
              type="button"
              onClick={() => setQuantity(presetVal)}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-all shrink-0 ${
                quantity === presetVal
                  ? 'bg-green-700 text-white border-green-700 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {presetVal.toLocaleString('en-IN')} {unit === 'kg' ? 'kg' : 'q'}
            </button>
          ))}
        </div>

        {/* Real-time Value Calculation */}
        <div className="bg-emerald-50/80 rounded-xl p-3 border border-emerald-200/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-800 font-semibold block flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
              {t('est_total_payout')}
            </span>
            <span className="text-lg font-black text-emerald-950">
              {formatINR(estimatedPayout)}
            </span>
          </div>
          <span className="text-[10px] bg-white px-2 py-1 rounded-md text-emerald-800 font-bold border border-emerald-200 shadow-2xs">
            {t('direct_bank_dbt')}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-4 bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 hover:brightness-105 active:scale-[0.98] text-white rounded-2xl font-extrabold text-base shadow-xl shadow-green-700/25 transition-all flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>{t('generating_pass')}</span>
          </div>
        ) : (
          <>
            <QrCode className="w-5 h-5" />
            <span>{t('btn_confirm_token')}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </>
        )}
      </button>
    </div>
  );
};
