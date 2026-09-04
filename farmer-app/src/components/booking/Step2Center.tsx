import React, { useState, useEffect } from 'react';
import { MandiCenter } from '../../types/schema';
import { useTranslation } from '../../hooks/useTranslation';
import { Building2, MapPin, Clock, Gauge, CheckCircle2, ShieldCheck, Filter } from 'lucide-react';
import { formatNumber } from '../../lib/utils';

interface Step2CenterProps {
  centers: MandiCenter[];
  selectedCrop: string;
  selectedCenterId: string;
  onSelectCenter: (center: MandiCenter) => void;
}

export const Step2Center: React.FC<Step2CenterProps> = ({
  centers,
  selectedCrop,
  selectedCenterId,
  onSelectCenter,
}) => {
  const { lang } = useTranslation();

  // Determine initial state filter based on language
  const getInitialStateFilter = (currentLang: string): 'all' | 'Karnataka' | 'Maharashtra' => {
    if (currentLang === 'kn') return 'Karnataka';
    if (currentLang === 'mr') return 'Maharashtra';
    return 'all';
  };

  const [stateFilter, setStateFilter] = useState<'all' | 'Karnataka' | 'Maharashtra'>(() => 
    getInitialStateFilter(lang)
  );

  // Sync state filter when user changes language
  useEffect(() => {
    setStateFilter(getInitialStateFilter(lang));
  }, [lang]);

  // Filter centers matching selected crop
  const cropMatchingCenters = centers.filter(c => 
    c.crop_type.toLowerCase() === selectedCrop.toLowerCase()
  );

  const baseList = cropMatchingCenters.length > 0 ? cropMatchingCenters : centers;

  // Apply state tab filter
  const displayCenters = baseList.filter(c => {
    if (stateFilter === 'all') return true;
    return c.state.toLowerCase() === stateFilter.toLowerCase();
  });

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* State Filter Tabs */}
      <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setStateFilter('all')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
            stateFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Mandis ({baseList.length})
        </button>

        <button
          onClick={() => setStateFilter('Karnataka')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            stateFilter === 'Karnataka'
              ? 'bg-green-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Karnataka (ಕರ್ನಾಟಕ)</span>
        </button>

        <button
          onClick={() => setStateFilter('Maharashtra')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            stateFilter === 'Maharashtra'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Maharashtra (महाराष्ट्र)</span>
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>Authorized APMC centers procuring <strong>{selectedCrop}</strong>:</span>
        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
          {displayCenters.length} Centers
        </span>
      </div>

      <div className="space-y-3">
        {displayCenters.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No centers found in this state for {selectedCrop}</p>
            <button
              onClick={() => setStateFilter('all')}
              className="mt-2 text-xs font-bold text-green-700 hover:underline"
            >
              Show all available APMC centers
            </button>
          </div>
        ) : (
          displayCenters.map((center: MandiCenter) => {
            const isSelected = selectedCenterId === center.center_id;
            return (
              <div
                key={center.center_id}
                onClick={() => onSelectCenter(center)}
                className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 active:scale-[0.99] ${
                  isSelected
                    ? 'border-green-600 bg-green-50/70 ring-2 ring-green-600/30 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 flex items-center justify-center shrink-0 mt-0.5 font-black text-sm">
                      {center.state === 'Karnataka' ? 'KA' : 'MH'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm md:text-base">
                          {center.center_name}
                        </h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> APMC Verified
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{center.location}, {center.district}, <strong>{center.state}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-green-700 fill-green-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300" />
                    )}
                  </div>
                </div>

                {/* Center Capabilities Grid */}
                <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-100 text-xs">
                  <div className="bg-white/80 rounded-xl p-2 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Daily Quota</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {formatNumber(center.daily_capacity_kg / 1000)} Tons
                    </span>
                  </div>

                  <div className="bg-white/80 rounded-xl p-2 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-0.5">
                      <Gauge className="w-3 h-3 text-slate-400" /> Hourly Limit
                    </span>
                    <span className="font-bold text-slate-800 text-xs">
                      {center.hourly_intake_limit} farmers/hr
                    </span>
                  </div>

                  <div className="bg-white/80 rounded-xl p-2 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-slate-400" /> Avg Process
                    </span>
                    <span className="font-bold text-green-800 text-xs">
                      ~{center.avg_processing_min} mins
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
