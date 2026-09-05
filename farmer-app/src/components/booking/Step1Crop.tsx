import React from 'react';
import { CROPS_DATA } from '../../lib/mockData';
import { CropInfo } from '../../types/schema';
import { useTranslation } from '../../hooks/useTranslation';
import { formatINR } from '../../lib/utils';
import { CheckCircle2, Award } from 'lucide-react';

interface Step1CropProps {
  selectedCrop: string;
  onSelectCrop: (cropId: string) => void;
}

export const Step1Crop: React.FC<Step1CropProps> = ({
  selectedCrop,
  onSelectCrop,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 border border-green-100/80 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-green-950 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-green-700" />
            <span>{t('msp_guaranteed_banner')}</span>
          </h3>
          <p className="text-xs text-green-800/80 mt-0.5">
            {t('msp_guaranteed_desc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CROPS_DATA.map((crop: CropInfo) => {
          const isSelected = selectedCrop === crop.id;
          return (
            <button
              key={crop.id}
              onClick={() => onSelectCrop(crop.id)}
              className={`relative flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] ${
                isSelected
                  ? 'border-green-600 bg-green-50/90 shadow-md shadow-green-700/10 ring-2 ring-green-600/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 text-green-700">
                  <CheckCircle2 className="w-4 h-4 fill-green-600 text-white" />
                </div>
              )}

              <div className="text-3xl mb-2">{crop.icon}</div>
              
              <div className="font-bold text-slate-900 text-sm leading-snug">
                {t(crop.nameKey, crop.id)}
              </div>

              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                {crop.category}
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 w-full flex items-baseline justify-between">
                <span className="text-[10px] text-slate-500 font-medium">MSP:</span>
                <span className="text-xs font-extrabold text-green-800">
                  {formatINR(crop.mspPrice)} <span className="text-[9px] font-normal text-slate-500">/q</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
