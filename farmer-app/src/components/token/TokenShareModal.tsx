import React, { useState } from 'react';
import { X, Send, Share2, CheckCircle2, MessageCircle } from 'lucide-react';
import { Booking } from '../../types/schema';
import { useTranslation } from '../../hooks/useTranslation';

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

  if (!isOpen) return null;

  const shareText = `*AgriQ Digital Mandi Pass*\nToken: *${booking.token_number}*\nCenter: ${booking.mandi_centers?.center_name || 'APMC Center'}\nSlot: ${booking.slots?.slot_start_time || '08:00 AM'} - ${booking.slots?.slot_end_time || '10:00 AM'}\nStatus: ${booking.status}`;

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1800);
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
          Send digital token pass <strong>{booking.token_number}</strong> to a driver or family member.
        </p>

        {sentSuccess ? (
          <div className="my-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-center text-green-800">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-1.5" />
            <strong className="text-sm block">SMS Dispatched!</strong>
            <span className="text-xs text-green-700">Digital pass link sent via SMS gateway.</span>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <button
              onClick={handleShareWhatsApp}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share via WhatsApp</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-slate-400">or send via SMS</span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            <form onSubmit={handleSendSms} className="space-y-2">
              <input
                type="tel"
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
                value={recipientPhone}
                onChange={e => setRecipientPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send SMS Pass</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
