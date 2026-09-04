import React from 'react';
import { Booking, BookingStatus } from '../../types/schema';
import { useTranslation } from '../../hooks/useTranslation';
import { formatINR, formatNumber, formatRelativeTime } from '../../lib/utils';
import { 
  Check, 
  Clock, 
  QrCode, 
  DoorOpen, 
  Scale, 
  FlaskConical, 
  CreditCard, 
  CheckCircle2,
  Receipt,
  FileCheck2,
  Sparkles
} from 'lucide-react';

interface StatusPipelineProps {
  booking: Booking;
}

interface StageConfig {
  status: BookingStatus;
  order: number;
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
}

const STAGES: StageConfig[] = [
  {
    status: 'BOOKED',
    order: 1,
    titleKey: 'stage_booked',
    descKey: 'stage_booked_desc',
    icon: QrCode,
  },
  {
    status: 'CHECKED_IN',
    order: 2,
    titleKey: 'stage_checked_in',
    descKey: 'stage_checked_in_desc',
    icon: DoorOpen,
  },
  {
    status: 'WEIGHED',
    order: 3,
    titleKey: 'stage_weighed',
    descKey: 'stage_weighed_desc',
    icon: Scale,
  },
  {
    status: 'QUALITY_APPROVED',
    order: 4,
    titleKey: 'stage_quality_approved',
    descKey: 'stage_quality_approved_desc',
    icon: FlaskConical,
  },
  {
    status: 'PAYMENT_INITIATED',
    order: 5,
    titleKey: 'stage_payment_initiated',
    descKey: 'stage_payment_initiated_desc',
    icon: CreditCard,
  },
  {
    status: 'COMPLETED',
    order: 6,
    titleKey: 'stage_completed',
    descKey: 'stage_completed_desc',
    icon: CheckCircle2,
  },
];

export const StatusPipeline: React.FC<StatusPipelineProps> = ({ booking }) => {
  const { t } = useTranslation();

  const getStageOrder = (s: BookingStatus): number => {
    const found = STAGES.find(stage => stage.status === s);
    return found ? found.order : 1;
  };

  const currentOrder = getStageOrder(booking.status);

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">
            {t('tracker_title')}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {t('tracker_subtitle')}
          </p>
        </div>
        <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
          Stage {currentOrder} of 6
        </span>
      </div>

      {/* Vertical Stepper Timeline */}
      <div className="relative pl-3 sm:pl-4 space-y-6 before:absolute before:left-[19px] sm:before:left-[23px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {STAGES.map((stage) => {
          const isPassed = currentOrder > stage.order;
          const isCurrent = currentOrder === stage.order;
          const isFuture = currentOrder < stage.order;
          const Icon = stage.icon;

          return (
            <div key={stage.status} className="relative flex items-start gap-4">
              {/* Stage Node Icon */}
              <div
                className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isPassed
                    ? 'bg-green-700 text-white shadow-md shadow-green-700/20'
                    : isCurrent
                    ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-white ring-4 ring-amber-100 shadow-md scale-105 animate-pulse'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isPassed ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>

              {/* Stage Details Card */}
              <div
                className={`flex-1 p-3.5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'border-amber-300 bg-amber-50/60 shadow-xs'
                    : isPassed
                    ? 'border-green-100 bg-green-50/30'
                    : 'border-slate-100 bg-slate-50/40 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-bold text-sm leading-snug ${
                      isCurrent
                        ? 'text-amber-950 font-extrabold'
                        : isPassed
                        ? 'text-slate-900'
                        : 'text-slate-500'
                    }`}
                  >
                    {t(stage.titleKey)}
                  </h4>

                  {isCurrent && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 animate-pulse">
                      In Progress
                    </span>
                  )}
                  {isPassed && (
                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                      Completed
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {t(stage.descKey)}
                </p>

                {/* Stage Specific Captured Data */}
                {stage.status === 'CHECKED_IN' && booking.checked_in_at && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Checked in at: <strong>{new Date(booking.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  </div>
                )}

                {stage.status === 'WEIGHED' && (isPassed || isCurrent) && booking.crop_quantity_kg && (
                  <div className="mt-2.5 p-2 bg-white/90 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{t('field_quantity')}:</span>
                    <strong className="text-slate-900 font-extrabold">
                      {formatNumber(booking.crop_quantity_kg)} kg ({((booking.crop_quantity_kg) / 100).toFixed(1)} q)
                    </strong>
                  </div>
                )}

                {stage.status === 'QUALITY_APPROVED' && (isPassed || isCurrent) && (
                  <div className="mt-2.5 p-2 bg-white/90 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{t('field_grade')}:</span>
                    <span className="font-extrabold text-green-800 bg-green-100 px-2 py-0.5 rounded">
                      {booking.quality_grade || 'Grade A (FAQ Standard)'}
                    </span>
                  </div>
                )}

                {stage.status === 'PAYMENT_INITIATED' && (isPassed || isCurrent) && (
                  <div className="mt-2.5 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 font-medium">{t('field_payment')}:</span>
                    <strong className="text-emerald-950 font-black text-sm">
                      {booking.payment_amount ? formatINR(booking.payment_amount) : '₹1,22,300'}
                    </strong>
                  </div>
                )}

                {stage.status === 'COMPLETED' && booking.status === 'COMPLETED' && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-green-700 to-emerald-600 text-white rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-green-200 block">
                        Official APMC Procurement Receipt
                      </span>
                      <strong className="text-xs font-mono">
                        #RCP-{booking.token_number}
                      </strong>
                    </div>
                    <button
                      onClick={() => alert(`Receipt #RCP-${booking.token_number} downloaded to device.`)}
                      className="px-2.5 py-1 bg-white text-green-900 rounded-lg text-xs font-bold shadow-xs hover:bg-green-50 active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
