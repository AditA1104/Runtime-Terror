import React from 'react';
import { Booking } from '../../types/schema';
import { useTranslation } from '../../hooks/useTranslation';
import { Users, Hourglass, Radio, CheckCircle, ArrowUpRight } from 'lucide-react';

interface LiveQueueCardProps {
  booking: Booking;
}

export const LiveQueueCard: React.FC<LiveQueueCardProps> = ({ booking }) => {
  const { t } = useTranslation();

  const getStageTitle = () => {
    switch (booking.status) {
      case 'BOOKED': return t('action_booked');
      case 'CHECKED_IN': return t('action_checked_in');
      case 'WEIGHED': return t('action_weighed');
      case 'QUALITY_APPROVED': return t('action_quality_approved');
      case 'PAYMENT_INITIATED': return t('action_payment_initiated');
      case 'COMPLETED': return t('action_completed');
      case 'CANCELLED': return t('action_cancelled');
      default: return booking.status;
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-900 via-green-800 to-slate-900 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl" />

      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> {t('live_queue_sync')}
          </span>
        </div>

        <span className="text-xs font-mono font-bold bg-white/15 px-2.5 py-0.5 rounded-md border border-white/10 text-white">
          {booking.token_number}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
          <span className="text-[10px] font-bold text-green-200 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-green-300" />
            {t('queue_position_label')}
          </span>
          <div className="text-2xl font-black text-white mt-1">
            {booking.queue_position !== undefined && booking.queue_position > 0 ? (
              <>
                #{booking.queue_position} <span className="text-xs font-normal text-green-200">{t('queue_in_line')}</span>
              </>
            ) : booking.status === 'COMPLETED' ? (
              <span className="text-sm font-bold text-emerald-300 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> {t('status_done')}
              </span>
            ) : (
              <span className="text-sm font-bold text-amber-300">{t('status_in_process')}</span>
            )}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
          <span className="text-[10px] font-bold text-green-200 uppercase tracking-wider flex items-center gap-1">
            <Hourglass className="w-3.5 h-3.5 text-green-300" />
            {t('est_wait_time')}
          </span>
          <div className="text-2xl font-black text-white mt-1">
            {booking.status === 'COMPLETED' ? (
              <span className="text-sm font-bold text-emerald-300">0 {t('mins')}</span>
            ) : (
              <>
                ~{booking.predicted_wait_mins || 15} <span className="text-xs font-normal text-green-200">{t('mins')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Current Instruction Banner */}
      <div className="mt-3.5 p-3 rounded-2xl bg-white/15 border border-white/15 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-green-300 font-bold uppercase block">{t('next_action')}</span>
          <strong className="text-white font-semibold block mt-0.5">
            {getStageTitle()}
          </strong>
        </div>
        <ArrowUpRight className="w-4 h-4 text-green-300 shrink-0" />
      </div>
    </div>
  );
};
