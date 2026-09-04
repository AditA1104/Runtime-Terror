import React, { useState } from 'react';
import { X, Send, Share2, CheckCircle2, MessageCircle, Copy, Check } from 'lucide-react';
import { Booking } from '../../types/schema';
import { useTranslation } from '../../hooks/useTranslation';
import { dispatchShareNotification } from '../../lib/api';

interface TokenShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
}

export const TokenShareModal: React.FC<TokenShareModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const { t } = useTranslation();
  const [recipientPhone, setRecipientPhone] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const center = booking.mandi_centers;
  const slot = booking.slots;

  const shareText = `🌾 *AgriQ Digital Mandi Gate Pass*\n\n` +
    `🎫 *Token Number:* *${booking.token_number}*\n` +
    `🏢 *Procurement Center:* ${center?.center_name || 'APMC Center'}\n` +
    `📍 *Location:* ${center?.location || 'Mandi Yard'}, ${center?.district || ''}\n` +
    `📅 *Arrival Slot:* ${slot?.slot_date || 'Today'} (${slot?.slot_start_time || '08:00 AM'} - ${slot?.slot_end_time || '10:00 AM'})\n` +
    `📦 *Commodity:* ${center?.crop_type || 'Produce'} (${booking.crop_quantity_kg || 2500} kg)\n` +
    `🚦 *Queue Status:* ${booking.status} (Position #${booking.queue_position || 1} at this mandi)\n\n` +
    `🔗 *Verify Gate Pass Online:* https://agriq.gov.in/t/${booking.token_number}\n\n` +
    `_Present this message or QR pass at Gate Security Counter #1. Valid for offline entry._`;

  const handleCopyPass = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    } catch (e) {
      console.warn('Clipboard copy error:', e);
    }
  };

  const handleShareWhatsApp = () => {
    const waUrl = recipientPhone.length === 10
      ? `https://api.whatsapp.com/send?phone=91${recipientPhone}&text=${encodeURIComponent(shareText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `AgriQ Mandi Gate Pass - ${booking.token_number}`,
          text: shareText,
          url: `https://agriq.gov.in/t/${booking.token_number}`,
        });
      } catch (err) {
        console.warn('Native share cancelled or failed:', err);
      }
    } else {
      handleShareWhatsApp();
    }
  };

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone) return;

    // 1. Copy pass text to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
    } catch (err) {
      // safe fallback
    }

    // 2. Dispatch simulated SMS into system notifications
    dispatchShareNotification({
      farmerId: booking.farmer_id,
      bookingId: booking.booking_id,
      recipientPhone: recipientPhone,
      message: `Gate Pass for Token ${booking.token_number} (${center?.center_name || 'Mandi'}) dispatched with QR verification link: https://agriq.gov.in/t/${booking.token_number}`,
    });

    // 3. On mobile devices, launch the native SMS app directly (without opening an about:blank tab)
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `sms:${recipientPhone}?body=${encodeURIComponent(shareText)}`;
    }

    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mb-3">
          <Share2 className="w-5 h-5" />
        </div>

        <h3 className="text-base font-extrabold text-slate-900">
          Share Token Pass
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Send digital pass <strong className="text-slate-800 font-mono">{booking.token_number}</strong> to a driver or family member.
        </p>

        {sentSuccess ? (
          <div className="my-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-center text-green-800 animate-in zoom-in-95 duration-150">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-1.5" />
            <strong className="text-sm block">SMS Dispatched!</strong>
            <span className="text-xs text-green-700 block mt-0.5">
              Sent to +91 {recipientPhone}. Pass details & link copied to clipboard.
            </span>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via Any App / Messaging</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleCopyPass}
                className={`py-2.5 px-3 rounded-2xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 ${
                  isCopied
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-slate-400">or send via SMS</span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            <form onSubmit={handleSendSms} className="space-y-2">
              <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 focus-within:ring-2 focus-within:ring-green-600 overflow-hidden">
                <span className="pl-3 text-xs font-bold text-slate-400">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile"
                  value={recipientPhone}
                  onChange={e => setRecipientPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-2.5 py-2.5 bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={recipientPhone.length !== 10}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send SMS Pass Link</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
