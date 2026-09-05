import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  User, 
  MapPin, 
  CheckCircle2, 
  Users, 
  UserPlus, 
  Check, 
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Farmer } from '../../types/schema';

interface PhoneLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: Farmer | null;
  savedAccounts: Farmer[];
  onSwitchAccount: (farmerId: string) => void;
  onAddNewAccount: (newProfile: Partial<Farmer>) => Farmer;
  onLogin: (phone: string, otp: string) => Promise<boolean>;
  onUpdateProfile: (profile: Partial<Farmer>) => Promise<Farmer | null>;
}

export const PhoneLoginModal: React.FC<PhoneLoginModalProps> = ({
  isOpen,
  onClose,
  farmer,
  savedAccounts,
  onSwitchAccount,
  onAddNewAccount,
  onLogin,
  onUpdateProfile,
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'switch' | 'new' | 'edit'>('switch');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  
  // Form State for new login / add
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  // Edit State
  const [editFullName, setEditFullName] = useState(farmer?.full_name || '');
  const [editVillage, setEditVillage] = useState(farmer?.village || '');
  const [editDistrict, setEditDistrict] = useState(farmer?.district || '');
  const [editState, setEditState] = useState(farmer?.state || '');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setStep('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter the 4-digit OTP');
      return;
    }
    setError('');
    setIsSubmitting(true);
    const success = await onLogin(phone, otp);
    setIsSubmitting(false);
    if (success) {
      onClose();
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleQuickAdd = (account: Partial<Farmer>) => {
    onAddNewAccount(account);
    onClose();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    setIsSubmitting(true);
    await onUpdateProfile({
      full_name: editFullName,
      village: editVillage,
      district: editDistrict,
      state: editState,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                {t('profiles_modal_title')}
              </h2>
              <p className="text-[11px] text-green-100 font-medium">
                {t('profiles_modal_sub')}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-4 flex bg-black/20 p-1 rounded-2xl backdrop-blur-sm">
            <button
              onClick={() => setTab('switch')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'switch' ? 'bg-white text-green-900 shadow-sm' : 'text-green-100 hover:text-white'
              }`}
            >
              {t('tab_switch')} ({savedAccounts.length})
            </button>
            <button
              onClick={() => setTab('new')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'new' ? 'bg-white text-green-900 shadow-sm' : 'text-green-100 hover:text-white'
              }`}
            >
              {t('tab_add_account')}
            </button>
            <button
              onClick={() => {
                setEditFullName(farmer?.full_name || '');
                setEditVillage(farmer?.village || '');
                setEditDistrict(farmer?.district || '');
                setEditState(farmer?.state || '');
                setTab('edit');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'edit' ? 'bg-white text-green-900 shadow-sm' : 'text-green-100 hover:text-white'
              }`}
            >
              {t('tab_edit_profile')}
            </button>
          </div>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <span className="shrink-0 font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* ================= TAB 1: SWITCH ACCOUNTS ================= */}
          {tab === 'switch' && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {t('saved_profiles')}
              </span>

              <div className="space-y-2.5">
                {savedAccounts.map(acc => {
                  const isActive = farmer?.farmer_id === acc.farmer_id;
                  return (
                    <div
                      key={acc.farmer_id}
                      onClick={() => {
                        onSwitchAccount(acc.farmer_id);
                        onClose();
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'border-green-600 bg-green-50/80 ring-2 ring-green-600/30 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                            isActive
                              ? 'bg-green-700 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {acc.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-900 font-extrabold text-sm block">
                              {acc.full_name}
                            </strong>
                            {isActive && (
                              <span className="text-[9px] font-extrabold uppercase bg-green-200 text-green-900 px-1.5 py-0.2 rounded-full">
                                {t('active_badge')}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {acc.village}, {acc.district} ({acc.state})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            +91 {acc.phone_number} • Lang: {acc.preferred_lang?.toUpperCase() || 'KN'}
                          </span>
                        </div>
                      </div>

                      {isActive ? (
                        <div className="w-6 h-6 rounded-full bg-green-700 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                        >
                          {t('tab_switch')}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => setTab('new')}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4 text-slate-600" />
                  <span>{t('login_another_phone')}</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: ADD NEW ACCOUNT ================= */}
          {tab === 'new' && (
            <div className="space-y-4">
              {step === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('phone_label')}
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-sm font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder={t('phone_placeholder')}
                        className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all text-base font-mono"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-green-700 hover:bg-green-800 active:scale-[0.98] text-white rounded-2xl font-bold shadow-lg shadow-green-700/25 transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{t('btn_send_otp')}</span>
                  </button>

                  {/* 1-Tap Demo Quick Presets */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {t('quick_add_demo_title')}
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd({
                          full_name: 'Mallikarjun Patil',
                          phone_number: '9845112233',
                          village: 'Aland',
                          district: 'Kalaburagi',
                          state: 'Karnataka',
                          preferred_lang: 'kn',
                        })}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-green-50 hover:border-green-300 border border-slate-200 text-left text-xs transition-all flex items-center justify-between"
                      >
                        <div>
                          <strong className="text-slate-900 block font-bold">🌾 Mallikarjun Patil (Karnataka)</strong>
                          <span className="text-[10px] text-slate-500">Kalaburagi APMC • Tur Dal • Kannada</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickAdd({
                          full_name: 'Nitin Deshmukh',
                          phone_number: '9822334455',
                          village: 'Yeola',
                          district: 'Nashik',
                          state: 'Maharashtra',
                          preferred_lang: 'mr',
                        })}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-green-50 hover:border-green-300 border border-slate-200 text-left text-xs transition-all flex items-center justify-between"
                      >
                        <div>
                          <strong className="text-slate-900 block font-bold">🧅 Nitin Deshmukh (Maharashtra)</strong>
                          <span className="text-[10px] text-slate-500">Lasalgaon APMC • Onion • Marathi</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center pb-1">
                    <span className="text-xs text-slate-500">{t('otp_sent_to')} </span>
                    <strong className="text-xs text-slate-800">+91 {phone}</strong>
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="ml-2 text-xs font-bold text-green-700 hover:underline"
                    >
                      {t('change_number')}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-center">
                      {t('otp_label')}
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234"
                      className="w-full text-center tracking-[0.6em] text-2xl font-bold py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all font-mono"
                      autoFocus
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-green-700 hover:bg-green-800 active:scale-[0.98] text-white rounded-2xl font-bold shadow-lg shadow-green-700/25 transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSubmitting ? t('verifying_btn') : t('btn_verify_otp')}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ================= TAB 3: EDIT PROFILE ================= */}
          {tab === 'edit' && (
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('farmer_name')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={editFullName}
                    onChange={e => setEditFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('village_name')}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={editVillage}
                      onChange={e => setEditVillage(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('district_name')}
                  </label>
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={e => setEditDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('state_name')}
                </label>
                <input
                  type="text"
                  value={editState}
                  onChange={e => setEditState(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-green-700 hover:bg-green-800 active:scale-[0.98] text-white rounded-2xl font-bold shadow-lg shadow-green-700/25 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? t('saving_btn') : t('save_profile')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
