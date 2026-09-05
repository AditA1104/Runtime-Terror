import React from 'react';
import { Home, CalendarPlus, QrCode, TrendingUp, MessageSquare } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export type ActiveTab = 'home' | 'book' | 'tokens' | 'insights' | 'alerts';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  hasActiveToken?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  hasActiveToken = false,
}) => {
  const { t } = useTranslation();

  const navItems = [
    { id: 'home' as ActiveTab, label: t('nav_home'), icon: Home },
    { id: 'book' as ActiveTab, label: t('nav_book'), icon: CalendarPlus, highlight: true },
    { id: 'tokens' as ActiveTab, label: t('nav_tokens'), icon: QrCode, badge: hasActiveToken },
    { id: 'insights' as ActiveTab, label: t('nav_insights'), icon: TrendingUp },
    { id: 'alerts' as ActiveTab, label: t('nav_alerts'), icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.highlight) {
            return (
              <div key={item.id} className="flex justify-center -mt-5">
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-tr from-green-800 to-green-600 text-white ring-4 ring-green-100'
                      : 'bg-gradient-to-tr from-green-700 to-emerald-500 text-white hover:brightness-105'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="w-6 h-6" />
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 transition-all relative ${
                isActive ? 'text-green-700 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[72px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
