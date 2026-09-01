import React, { useState } from 'react';
import { X, Smartphone, ShieldCheck, User, MapPin, CheckCircle2, Sparkles } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Farmer } from '../../types/schema';

interface PhoneLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: Farmer | null;
  onLogin: (phone: string, otp: string) => Promise<boolean>;
  onUpdateProfile: (profile: Partial<Farmer>) => Promise<Farmer | null>;
}

export const PhoneLoginModal: React.FC<PhoneLoginModalProps> = ({
  isOpen,
  onClose,
  farmer,
  onLogin,
  onUpdateProfile,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phone, setPhone] = useState(farmer?.phone_number || '');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState(farmer?.full_name || 'Ramesh Patil');
  const [village, setVillage] = useState(farmer?.village || 'Pimpalgaon Baswant');
  const [district, setDistrict] = useState(farmer?.district || 'Nashik');
  const [state, setState] = useState(farmer?.state || 'Maharashtra');
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
      setError('Please enter the 4-digit OTP sent to your phone');
      return;
    }
    setError('');
    setIsSubmitting(true);
    const success = await onLogin(phone, otp);
    setIsSubmitting(false);
    if (success) {
      setStep('profile');
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    setIsSubmitting(true);
    await onUpdateProfile({
      full_name: fullName,
      village,
      district,
      state,
      phone_number: phone,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-3 backdrop-blur-sm border border-white/20">
            {step === 'profile' ? <User className="w-6 h-6 text-white" /> : <Smartphone className="w-6 h-6 text-white" />}
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {step === 'profile' ? t('profile_welcome') : t('login_title')}
          </h2>
          <p className="text-xs text-green-100 mt-1 font-medium">
            {step === 'profile' ? 'Verify your farmer details for official APMC procurement tokens' : t('login_subtitle')}
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <span className="shrink-0 font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {step === 'phone' && (
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
                    className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all text-base"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-green-700 hover:bg-green-800 active:scale-[0.98] text-white rounded-2xl font-bold shadow-lg shadow-green-700/25 transition-all flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{t('btn_send_otp')}</span>
                </button>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/60 flex items-start gap-2 text-xs text-amber-800">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{t('otp_demo_hint')}</span>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center pb-2">
                <span className="text-xs text-slate-500">OTP sent to </span>
                <strong className="text-xs text-slate-800">+91 {phone}</strong>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="ml-2 text-xs font-bold text-green-700 hover:underline"
                >
                  {t('btn_change_phone')}
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
                  className="w-full text-center tracking-[0.6em] text-2xl font-bold py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                  autoFocus
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-green-700 hover:bg-green-800 active:scale-[0.98] text-white rounded-2xl font-bold shadow-lg shadow-green-700/25 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Verifying...' : t('btn_verify_otp')}</span>
                </button>
              </div>
            </form>
          )}

          {step === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('farmer_name')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
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
                      value={village}
                      onChange={e => setVillage(e.target.value)}
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
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
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
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-green-700 hover:bg-green-800 active:scale-[0.98] text-white rounded-2xl font-bold shadow-lg shadow-green-700/25 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : t('save_profile')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
