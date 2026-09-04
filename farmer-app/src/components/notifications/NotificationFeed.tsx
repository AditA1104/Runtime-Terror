import React from 'react';
import { NotificationItem } from '../../types/schema';
import { useTranslation } from '../../hooks/useTranslation';
import { formatRelativeTime } from '../../lib/utils';
import { formatNotificationMessage } from '../../lib/notificationFormatter';
import { MessageSquare, Bell, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface NotificationFeedProps {
  notifications: NotificationItem[];
  onSelectBooking?: (bookingId: string) => void;
}

export const NotificationFeed: React.FC<NotificationFeedProps> = ({
  notifications,
  onSelectBooking,
}) => {
  const { t, language } = useTranslation();

  return (
    <div className="max-w-md mx-auto space-y-4 animate-in fade-in duration-200 pb-20">
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-green-100 text-green-800 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                {t('notifications_title')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Simulated SMS & Mandi alerts delivered to your phone
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {notifications.length} Logs
          </span>
        </div>

        {notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            {t('notifications_empty')}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {notifications.map(notif => {
              const isRateAdvisory = notif.message.includes('Advisory');
              const isPayment = notif.message.includes('Payment');
              const isCheckedIn = notif.message.includes('Checked in');

              return (
                <div key={notif.notification_id} className="py-3.5 flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                      isPayment
                        ? 'bg-purple-100 text-purple-700'
                        : isCheckedIn
                        ? 'bg-blue-100 text-blue-700'
                        : isRateAdvisory
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {isPayment ? '₹' : isRateAdvisory ? '★' : '💬'}
                  </div>

                  <div className="flex-1 text-xs">
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {formatNotificationMessage(notif, language)}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold uppercase tracking-wider">
                        via {notif.channel.toUpperCase()} Gateway
                      </span>
                      <span>{formatRelativeTime(notif.sent_at)}</span>
                    </div>

                    {notif.booking_id && onSelectBooking && (
                      <button
                        onClick={() => onSelectBooking(notif.booking_id!)}
                        className="mt-1.5 text-[11px] font-bold text-green-700 hover:underline"
                      >
                        View Digital Pass →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
