import React, { useState, useEffect } from 'react';
import { MandiCenter, SlotAvailable, DailyRatesCache, Booking, Farmer } from '../../types/schema';
import { useTranslation } from '../../hooks/useTranslation';
import { getMandiCenters, getSlotsAvailable, getDailyRatesCache, createBooking } from '../../lib/api';
import { Step1Crop } from './Step1Crop';
import { Step2Center } from './Step2Center';
import { Step3Slot } from './Step3Slot';
import { Step4Confirm } from './Step4Confirm';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';

interface BookingWizardProps {
  farmer: Farmer | null;
  onBookingCreated: (booking: Booking) => void;
  onCancel: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  farmer,
  onBookingCreated,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedCrop, setSelectedCrop] = useState<string>('Soybean');
  const [centers, setCenters] = useState<MandiCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<MandiCenter | null>(null);
  const [availableSlots, setAvailableSlots] = useState<SlotAvailable[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<SlotAvailable | null>(null);
  const [dailyRates, setDailyRates] = useState<DailyRatesCache[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Load Centers on Mount
  useEffect(() => {
    getMandiCenters().then(data => {
      setCenters(data);
      if (data.length > 0) {
        setSelectedCenter(data[0]);
      }
    });
  }, []);

  // 2. Load Slots & Predictive Rates when Center or Crop changes
  useEffect(() => {
    if (selectedCenter) {
      setIsLoading(true);
      Promise.all([
        getSlotsAvailable(selectedCenter.center_id),
        getDailyRatesCache(selectedCrop, selectedCenter.center_id),
      ]).then(([slots, rates]) => {
        setAvailableSlots(slots);
        setDailyRates(rates);
        if (slots.length > 0) {
          const firstDate = slots[0].slot_date;
          setSelectedDate(firstDate);
          setSelectedSlot(slots[0]);
        }
        setIsLoading(false);
      });
    }
  }, [selectedCenter, selectedCrop]);

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4);
    } else {
      onCancel();
    }
  };

  const handleFinalSubmit = async (quantityKg: number) => {
    if (!selectedCenter || !selectedSlot) return;
    setIsSubmitting(true);
    try {
      const newBooking = await createBooking({
        farmerId: farmer?.farmer_id || 'f8888888-8888-8888-8888-888888888888',
        centerId: selectedCenter.center_id,
        slotId: selectedSlot.slot_id,
        cropQuantityKg: quantityKg,
        selectedSlot,
        mandiCenter: selectedCenter,
      });
      onBookingCreated(newBooking);
    } catch (e) {
      console.error('Booking failed:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    { num: 1, title: t('wizard_step1_title'), desc: t('wizard_step1_desc') },
    { num: 2, title: t('wizard_step2_title'), desc: t('wizard_step2_desc') },
    { num: 3, title: t('wizard_step3_title'), desc: t('wizard_step3_desc') },
    { num: 4, title: t('wizard_step4_title'), desc: t('wizard_step4_desc') },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Wizard Top Bar & Step Progress */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevStep}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-green-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? 'Cancel' : t('btn_back')}</span>
          </button>

          <span className="text-xs font-extrabold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            Step {currentStep} of 4
          </span>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="grid grid-cols-4 gap-2 relative">
          {stepTitles.map(s => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-green-700 text-white'
                      : isCurrent
                      ? 'bg-green-600 text-white ring-4 ring-green-100 scale-105'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-[10px] mt-1 font-bold truncate max-w-full ${
                  isCurrent ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {s.title.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Header Title for Current Step */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900">
            {stepTitles[currentStep - 1].title}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {stepTitles[currentStep - 1].desc}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-4">
        {currentStep === 1 && (
          <>
            <Step1Crop
              selectedCrop={selectedCrop}
              onSelectCrop={cropId => {
                setSelectedCrop(cropId);
                // auto-select first matching center
                const match = centers.find(c => c.crop_type.toLowerCase() === cropId.toLowerCase());
                if (match) setSelectedCenter(match);
              }}
            />
            <div className="pt-2">
              <button
                onClick={handleNextStep}
                className="w-full py-3.5 bg-green-700 hover:bg-green-800 active:scale-[0.98] text-white rounded-2xl font-bold shadow-lg shadow-green-700/25 transition-all text-sm"
              >
                {t('btn_next')} →
              </button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <Step2Center
              centers={centers}
              selectedCrop={selectedCrop}
              selectedCenterId={selectedCenter?.center_id || ''}
              onSelectCenter={center => setSelectedCenter(center)}
            />
            <div className="pt-2">
              <button
                onClick={handleNextStep}
                disabled={!selectedCenter}
                className="w-full py-3.5 bg-green-700 hover:bg-green-800 active:scale-[0.98] text-white rounded-2xl font-bold shadow-lg shadow-green-700/25 transition-all text-sm"
              >
                {t('btn_next')} →
              </button>
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            <Step3Slot
              selectedDate={selectedDate}
              onSelectDate={date => {
                setSelectedDate(date);
                const matchingSlot = availableSlots.find(s => s.slot_date === date);
                if (matchingSlot) setSelectedSlot(matchingSlot);
              }}
              availableSlots={availableSlots}
              selectedSlotId={selectedSlot?.slot_id || ''}
              onSelectSlot={slot => setSelectedSlot(slot)}
              dailyRates={dailyRates}
            />
            <div className="pt-2">
              <button
                onClick={handleNextStep}
                disabled={!selectedSlot}
                className="w-full py-3.5 bg-green-700 hover:bg-green-800 active:scale-[0.98] text-white rounded-2xl font-bold shadow-lg shadow-green-700/25 transition-all text-sm"
              >
                {t('btn_next')} →
              </button>
            </div>
          </>
        )}

        {currentStep === 4 && selectedCenter && selectedSlot && (
          <Step4Confirm
            cropId={selectedCrop}
            center={selectedCenter}
            slot={selectedSlot}
            farmer={farmer}
            onConfirmBooking={handleFinalSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};
