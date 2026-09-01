import React from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface OfflineBannerProps {
  isOnline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline }) => {
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <div className="bg-amber-600 text-white px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between shadow-md sticky top-0 z-50 animate-pulse">
      <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
        <WifiOff className="w-4 h-4 shrink-0 text-amber-100" />
        <span>
          <strong>{t('offline_badge')}:</strong> {t('offline_msg')}
        </span>
      </div>
    </div>
  );
};
