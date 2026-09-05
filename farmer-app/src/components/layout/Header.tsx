import React from 'react';
import { Sprout, User, Radio, Bell } from 'lucide-react';
import { LanguageSelector } from '../auth/LanguageSelector';
import { useTranslation } from '../../hooks/useTranslation';
import { Farmer } from '../../types/schema';
import { isSupabaseLive } from '../../lib/supabase';

interface HeaderProps {
  farmer: Farmer | null;
  onOpenAuth: () => void;
  unreadCount?: number;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  farmer,
  onOpenAuth,
  unreadCount = 0,
  onOpenNotifications,
}) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-green-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-green-700/20">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
                {t('app_title')}
              </h1>
              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200/60">
                <Radio className={`w-2.5 h-2.5 ${isSupabaseLive ? 'text-green-600 animate-pulse' : 'text-amber-600'}`} />
                {isSupabaseLive ? t('live_sync') : t('demo_ready')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              {t('app_tagline')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full text-slate-600 hover:text-green-700 hover:bg-green-50 active:scale-95 transition-all"
            title={t('nav_alerts')}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Regional Language Switcher */}
          <LanguageSelector compact />

          {/* Farmer Profile Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-xs font-semibold text-slate-700"
          >
            <div className="w-6 h-6 rounded-full bg-green-700 text-white flex items-center justify-center text-[11px] font-bold">
              {farmer?.full_name ? farmer.full_name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <span className="max-w-[80px] truncate hidden sm:inline">
              {farmer?.full_name || t('login_btn_text')}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
