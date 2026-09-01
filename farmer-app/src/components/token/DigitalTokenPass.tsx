import React, { useState } from 'react';
import { Booking } from '../../types/schema';
import { useTranslation } from '../../hooks/useTranslation';
import { QRCodeDisplay } from './QRCodeDisplay';
import { TokenShareModal } from './TokenShareModal';
import { formatTimeSlot, formatDate, formatINR, formatNumber } from '../../lib/utils';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Hourglass, 
  Share2, 
  Download, 
  XCircle, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface DigitalTokenPassProps {
  booking: Booking;
  onCancelBooking?: (bookingId: string) => void;
  onViewTracker?: () => void;
}

export const DigitalTokenPass: React.FC<DigitalTokenPassProps> = ({
  booking,
  onCancelBooking,
  onViewTracker,
}) => {
  const { t } = useTranslation();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSavedOffline, setIsSavedOffline] = useState(false);

  const center = booking.mandi_centers;
  const slot = booking.slots;

  const handleSaveOffline = () => {
    try {
      localStorage.setItem(`agriq_cached_pass_${booking.booking_id}`, JSON.stringify(booking));
      setIsSavedOffline(true);
      setTimeout(() => setIsSavedOffline(false), 2500);
    } catch (e) {
      console.error('Error saving pass offline:', e);
    }
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'BOOKED':
        return { text: 'Slot Confirmed', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'CHECKED_IN':
        return { text: 'Checked-in at Gate', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'WEIGHED':
        return { text: 'Weight Logged', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'QUALITY_APPROVED':
        return { text: 'Quality Approved', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'PAYMENT_INITIATED':
        return { text: 'DBT Initiated', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'COMPLETED':
        return { text: 'Procurement Done', bg: 'bg-green-100 text-green-900 border-green-400' };
      case 'CANCELLED':
        return { text: 'Cancelled', bg: 'bg-red-100 text-red-800 border-red-300' };
      default:
        return { text: booking.status, bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      {/* The Digital Gate Pass "Card" */}
      <div className="bg-white rounded-3xl border-2 border-slate-800/10 shadow-xl overflow-hidden relative">
        {/* Pass Top Header / Government APMC Header */}
        <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 p-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
              <span className="text-[11px] font-black uppercase tracking-wider text-green-100">
                APMC Smart Procurement Pass
              </span>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${statusBadge.bg}`}>
              {statusBadge.text}
            </span>
          </div>

          {/* Big Bold Token Number Display */}
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-200 block">
                {t('token_number')}
              </span>
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                {booking.token_number}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-200 block">
                Created Via
              </span>
              <span className="text-xs font-black uppercase bg-white/20 px-2 py-0.5 rounded-md">
                {booking.created_via || 'Web PWA'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic QR Code Section */}
        <div className="p-5 bg-slate-50/50 flex flex-col items-center justify-center border-b border-dashed border-slate-200">
          <QRCodeDisplay
            tokenNumber={booking.token_number}
            bookingId={booking.booking_id}
            farmerId={booking.farmer_id}
            centerId={booking.center_id}
            size={180}
          />
        </div>

        {/* Live Queue & Wait Time Metrics */}
        {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
          <div className="grid grid-cols-2 divide-x divide-slate-100 bg-amber-50/50 border-b border-slate-100">
            <div className="p-3.5 text-center">
              <span className="text-[10px] font-bold text-amber-900/70 uppercase tracking-wider flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                {t('queue_position_label')}
              </span>
              <div className="text-xl font-black text-amber-950 mt-0.5">
                {booking.queue_position !== undefined && booking.queue_position > 0 ? (
                  <>
                    #{booking.queue_position} <span className="text-xs font-bold text-amber-800">{t('queue_in_line')}</span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-green-700">At Checkpoint</span>
                )}
              </div>
            </div>

            <div className="p-3.5 text-center">
              <span className="text-[10px] font-bold text-amber-900/70 uppercase tracking-wider flex items-center justify-center gap-1">
                <Hourglass className="w-3.5 h-3.5 text-amber-700" />
                {t('est_wait_time')}
              </span>
              <div className="text-xl font-black text-amber-950 mt-0.5">
                ~{booking.predicted_wait_mins || 15} <span className="text-xs font-bold text-amber-800">{t('mins')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Center & Slot Details */}
        <div className="p-5 space-y-3.5 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 font-bold text-sm block">
                {center?.center_name || 'Nashik APMC Main Yard'}
              </strong>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                {center?.location || 'Nashik, Maharashtra'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-start gap-2">
              <Calendar className="w-3.5 h-3.5 text-green-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Date</span>
                <strong className="text-slate-800">
                  {slot?.slot_date ? formatDate(slot.slot_date) : formatDate(booking.created_at ? booking.created_at.split('T')[0] : '')}
                </strong>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-green-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Gate Window</span>
                <strong className="text-amber-800 font-bold">
                  {slot?.slot_start_time && slot?.slot_end_time 
                    ? formatTimeSlot(slot.slot_start_time, slot.slot_end_time) 
                    : '08:00 AM – 10:00 AM'}
                </strong>
              </div>
            </div>
          </div>

          {/* Produce & Quantity */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Crop & Declared Weight</span>
              <strong className="text-slate-900 font-bold text-sm">
                {center?.crop_type || 'Soybean'} • {formatNumber(booking.crop_quantity_kg || 2500)} kg ({((booking.crop_quantity_kg || 2500) / 100).toFixed(1)} q)
              </strong>
            </div>
            {booking.payment_amount && (
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">DBT Payout</span>
                <strong className="text-green-800 font-extrabold text-sm">
                  {formatINR(booking.payment_amount)}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Live Tracker Direct Link */}
        {onViewTracker && (
          <div className="p-4 bg-green-50/70 border-t border-green-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600 animate-ping" />
              <span className="text-xs font-extrabold text-green-900">
                Track Live Mandi Checkpoint Progress
              </span>
            </div>
            <button
              onClick={onViewTracker}
              className="text-xs font-extrabold text-green-700 bg-white px-3 py-1.5 rounded-xl border border-green-200 hover:bg-green-100 active:scale-95 shadow-2xs transition-all"
            >
              View Tracker →
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={handleSaveOffline}
          className="py-3 px-4 bg-white border border-slate-200 hover:border-slate-300 active:scale-95 rounded-2xl text-xs font-bold text-slate-800 shadow-xs flex items-center justify-center gap-1.5 transition-all"
        >
          {isSavedOffline ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-green-800">Saved Offline!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-slate-500" />
              <span>{t('btn_download_pass')}</span>
            </>
          )}
        </button>

        <button
          onClick={() => setIsShareModalOpen(true)}
          className="py-3 px-4 bg-white border border-slate-200 hover:border-slate-300 active:scale-95 rounded-2xl text-xs font-bold text-slate-800 shadow-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Share2 className="w-4 h-4 text-slate-500" />
          <span>{t('btn_share_sms')}</span>
        </button>
      </div>

      {/* Cancel Action if still BOOKED */}
      {booking.status === 'BOOKED' && onCancelBooking && (
        <button
          onClick={() => onCancelBooking(booking.booking_id)}
          className="w-full py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"
        >
          <XCircle className="w-4 h-4" />
          <span>{t('btn_cancel_booking')}</span>
        </button>
      )}

      {/* Share Modal */}
      <TokenShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        booking={booking}
      />
    </div>
  );
};
