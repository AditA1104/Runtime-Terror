import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { BottomNav, ActiveTab } from './components/layout/BottomNav';
import { OfflineBanner } from './components/layout/OfflineBanner';
import { PhoneLoginModal } from './components/auth/PhoneLoginModal';
import { BookingWizard } from './components/booking/BookingWizard';
import { DigitalTokenPass } from './components/token/DigitalTokenPass';
import { LiveQueueCard } from './components/tracker/LiveQueueCard';
import { StatusPipeline } from './components/tracker/StatusPipeline';
import { BestDayCard } from './components/predictive/BestDayCard';
import { PriceTrendChart } from './components/predictive/PriceTrendChart';
import { NotificationFeed } from './components/notifications/NotificationFeed';
import { DemoController } from './components/demo/DemoController';

import { useFarmerAuth } from './hooks/useFarmerAuth';
import { useTranslation } from './hooks/useTranslation';
import { useSupabaseRealtime } from './hooks/useSupabaseRealtime';
import { useOfflineCache } from './hooks/useOfflineCache';
import { getMandiCenters, getDailyRatesCache, getFarmerNotifications } from './lib/api';
import { MandiCenter, DailyRatesCache, NotificationItem, Booking } from './types/schema';
import { formatDate } from './lib/utils';
import { 
  CalendarPlus, 
  QrCode, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  ArrowRight,
  RefreshCw,
  BellRing,
  Download
} from 'lucide-react';

export function App() {
  const { 
    farmer, 
    savedAccounts, 
    switchAccount, 
    addNewAccount, 
    loginWithPhone, 
    updateProfile 
  } = useFarmerAuth();
  const { t } = useTranslation();
  const { isOnline, isInstallable, installPwa } = useOfflineCache();
  const { bookings, activeBooking, setActiveBooking, refreshData } = useSupabaseRealtime(farmer?.farmer_id || '');

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [centers, setCenters] = useState<MandiCenter[]>([]);
  const [selectedCropInsight, setSelectedCropInsight] = useState('Onion');
  const [dailyRates, setDailyRates] = useState<DailyRatesCache[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Initial Data Fetch
  useEffect(() => {
    getMandiCenters().then(data => {
      setCenters(data);
      const matchingCenter = data.find(
        c => c.crop_type.toLowerCase() === selectedCropInsight.toLowerCase()
      ) || data[0];
      if (matchingCenter) {
        // IMPORTANT: always use the center's REAL crop_type here, never the
        // possibly-stale selectedCropInsight — otherwise a mismatched
        // crop/center pair silently queries for data that can never exist,
        // and falls back to fabricated mock data with no visible warning.
        setSelectedCropInsight(matchingCenter.crop_type);
        getDailyRatesCache(matchingCenter.crop_type, matchingCenter.center_id).then(setDailyRates);
      }
    });

    getFarmerNotifications(farmer?.farmer_id || '').then(setNotifications);
  }, [farmer?.farmer_id, selectedCropInsight]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    const matchingCenter = centers.find(
      c => c.crop_type.toLowerCase() === selectedCropInsight.toLowerCase()
    ) || centers[0];
    if (matchingCenter) {
      const rates = await getDailyRatesCache(matchingCenter.crop_type, matchingCenter.center_id);
      setDailyRates(rates);
    }
    const notifs = await getFarmerNotifications(farmer?.farmer_id || '');
    setNotifications(notifs);
    setIsRefreshing(false);
  };

  const handleBookingCreated = (newBooking: Booking) => {
    setActiveBooking(newBooking);
    setActiveTab('tokens');
    handleManualRefresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-green-100 selection:text-green-900 pb-20">
      {/* Offline Status Bar */}
      <OfflineBanner isOnline={isOnline} />

      {/* Main Header */}
      <Header
        farmer={farmer}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        unreadCount={notifications.length}
        onOpenNotifications={() => setActiveTab('alerts')}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6">
        {/* ===================== TAB 1: HOME ===================== */}
        {activeTab === 'home' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* PWA Install Promo if available */}
            {isInstallable && (
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2.5">
                  <Download className="w-5 h-5 text-emerald-200 shrink-0" />
                  <div className="text-xs">
                    <strong className="block font-bold">Install AgriQ Farmer App</strong>
                    <span className="text-emerald-100 text-[11px]">Access offline token pass inside mandi yard</span>
                  </div>
                </div>
                <button
                  onClick={installPwa}
                  className="px-3 py-1.5 bg-white text-green-900 rounded-xl text-xs font-black shadow-xs active:scale-95"
                >
                  Install
                </button>
              </div>
            )}

            {/* Farmer Greeting & Quick Action Hero */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200/60">
                    🌾 {farmer?.village || 'Nashik District'}, {farmer?.state || 'Maharashtra'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
                    {t('profile_welcome')}, {farmer?.full_name ? farmer.full_name.split(' ')[0] : 'Kisan'}!
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {t('hero_subtitle')}
                  </p>
                </div>

                <button
                  onClick={handleManualRefresh}
                  className={`p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all ${
                    isRefreshing ? 'animate-spin text-green-700' : ''
                  }`}
                  title="Refresh Live Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Action Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab('book')}
                  className="p-3.5 bg-gradient-to-r from-green-700 to-emerald-600 hover:brightness-105 active:scale-[0.98] text-white rounded-2xl shadow-md shadow-green-700/20 text-left transition-all"
                >
                  <CalendarPlus className="w-5 h-5 mb-1.5 text-green-200" />
                  <span className="font-extrabold text-sm block">
                    {t('btn_new_booking')}
                  </span>
                  <span className="text-[10px] text-green-100 font-medium">
                    Select crop & mandi slot
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('tokens')}
                  className="p-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-2xl shadow-md shadow-slate-900/10 text-left transition-all"
                >
                  <QrCode className="w-5 h-5 mb-1.5 text-amber-300" />
                  <span className="font-extrabold text-sm block">
                    {t('btn_view_pass')}
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium">
                    {activeBooking ? `${activeBooking.token_number} (${activeBooking.status})` : 'No active pass'}
                  </span>
                </button>
              </div>
            </div>

            {/* Active Live Token Banner if farmer has one today */}
            {activeBooking && activeBooking.status !== 'COMPLETED' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-600 animate-ping" />
                    {t('active_token_banner')}
                  </h3>
                  <button
                    onClick={() => setActiveTab('tokens')}
                    className="text-xs font-bold text-green-700 hover:underline"
                  >
                    View Details →
                  </button>
                </div>
                <LiveQueueCard booking={activeBooking} />
              </div>
            )}

            {/* "Best Day to Sell" AI Advisor Card */}
            {dailyRates.length > 0 && centers.length > 0 && (
              <BestDayCard
                rates={dailyRates}
                cropType={selectedCropInsight}
                centerName={centers[0].center_name}
                onBookBestDay={() => {
                  setActiveTab('book');
                }}
              />
            )}

            {/* 7-Day Price Forecast Visualizer */}
            {dailyRates.length > 0 && (
              <PriceTrendChart
                rates={dailyRates}
                onSelectDate={() => setActiveTab('book')}
              />
            )}
          </div>
        )}

        {/* ===================== TAB 2: BOOK WIZARD ===================== */}
        {activeTab === 'book' && (
          <BookingWizard
            farmer={farmer}
            onBookingCreated={handleBookingCreated}
            onCancel={() => setActiveTab('home')}
          />
        )}

        {/* ===================== TAB 3: DIGITAL TOKEN PASS & TRACKER ===================== */}
        {activeTab === 'tokens' && (
          <div className="space-y-6 animate-in fade-in duration-200 pb-20">
            {activeBooking ? (
              <>
                <DigitalTokenPass
                  booking={activeBooking}
                  onCancelBooking={async () => {
                    if (window.confirm('Are you sure you want to cancel this booking?')) {
                      // Transition to CANCELLED
                      const { transitionBookingStatus } = await import('./lib/api');
                      await transitionBookingStatus(activeBooking.booking_id, 'CANCELLED');
                      handleManualRefresh();
                    }
                  }}
                />

                <StatusPipeline booking={activeBooking} />
              </>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto">
                  <QrCode className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    No Active Mandi Tokens
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Book a digital slot to get your gate entry QR pass and avoid long mandi queues.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('book')}
                  className="px-6 py-3 bg-green-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-green-700/20 active:scale-95"
                >
                  {t('btn_new_booking')} →
                </button>
              </div>
            )}

            {/* Past Bookings History List */}
            {bookings.length > 1 && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900">
                  Your Token History ({bookings.length})
                </h4>
                <div className="divide-y divide-slate-100">
                  {bookings.map(b => (
                    <div
                      key={b.booking_id}
                      onClick={() => setActiveBooking(b)}
                      className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-xl px-2 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-mono text-slate-900 font-bold">
                            {b.token_number}
                          </strong>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {b.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {b.mandi_centers?.center_name || 'APMC Yard'} • {formatDate(b.created_at.split('T')[0])}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 4: BEST DAY AI INSIGHTS ===================== */}
        {activeTab === 'insights' && (
          <div className="space-y-5 animate-in fade-in duration-200 pb-20">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>{t('best_day_title')}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time smart dispatch optimizer for agricultural commodities
                  </p>
                </div>
              </div>

              {/* Crop Selector Buttons */}
              <div className="mt-4">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Select Commodity to Forecast:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {/* Derived from REAL centers only — a hardcoded list here
                      previously included crops (Soybean, Paddy, Gram) with
                      no matching real center, which silently triggered
                      fabricated mock data every time they were tapped. */}
                  {Array.from(new Set(centers.map(c => c.crop_type))).map(crop => (
                    <button
                      key={crop}
                      onClick={() => setSelectedCropInsight(crop)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all capitalize ${
                        selectedCropInsight.toLowerCase() === crop.toLowerCase()
                          ? 'bg-green-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendation Card */}
            {dailyRates.length > 0 && centers.length > 0 && (
              <BestDayCard
                rates={dailyRates}
                cropType={selectedCropInsight}
                centerName={centers[0].center_name}
                onBookBestDay={() => {
                  setActiveTab('book');
                }}
              />
            )}

            {/* Price vs Rush Visualization */}
            {dailyRates.length > 0 && (
              <PriceTrendChart
                rates={dailyRates}
                onSelectDate={() => setActiveTab('book')}
              />
            )}
          </div>
        )}

        {/* ===================== TAB 5: ALERTS / SMS FEED ===================== */}
        {activeTab === 'alerts' && (
          <NotificationFeed
            notifications={notifications}
            onSelectBooking={bookingId => {
              const found = bookings.find(b => b.booking_id === bookingId);
              if (found) {
                setActiveBooking(found);
                setActiveTab('tokens');
              }
            }}
          />
        )}
      </main>

      {/* Floating Demo Simulation Controller (for live hackathon presentations) */}
      <DemoController
        activeBooking={activeBooking}
        onRefresh={handleManualRefresh}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasActiveToken={!!activeBooking && activeBooking.status !== 'COMPLETED'}
      />

      {/* Phone Login, Profile & Multi-Account Switcher Modal */}
      <PhoneLoginModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        farmer={farmer}
        savedAccounts={savedAccounts}
        onSwitchAccount={id => {
          switchAccount(id);
          setTimeout(handleManualRefresh, 100);
        }}
        onAddNewAccount={profile => {
          const created = addNewAccount(profile);
          setTimeout(handleManualRefresh, 100);
          return created;
        }}
        onLogin={async (phone, otp) => {
          const success = await loginWithPhone(phone, otp);
          if (success) {
            setTimeout(handleManualRefresh, 100);
          }
          return success;
        }}
        onUpdateProfile={updateProfile}
      />
    </div>
  );
}
export default App;
