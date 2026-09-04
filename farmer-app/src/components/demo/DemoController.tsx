import React, { useState } from 'react';
import { Booking, BookingStatus } from '../../types/schema';
import { transitionBookingStatus } from '../../lib/api';
import { Play, RotateCcw, ChevronUp, ChevronDown, CheckCircle2, Zap } from 'lucide-react';

interface DemoControllerProps {
  activeBooking: Booking | null;
  onRefresh: () => void;
}

export const DemoController: React.FC<DemoControllerProps> = ({
  activeBooking,
  onRefresh,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!activeBooking) return null;

  const handleTransition = async (nextStatus: BookingStatus) => {
    setIsProcessing(true);
    await transitionBookingStatus(activeBooking.booking_id, nextStatus, 'demo-officer-desk');
    onRefresh();
    setIsProcessing(false);
  };

  const steps: { label: string; status: BookingStatus; desc: string }[] = [
    { label: 'Gate Scan (Check-in)', status: 'CHECKED_IN', desc: 'Simulate officer scanning QR at entry gate' },
    { label: 'Weighbridge (2,500 kg)', status: 'WEIGHED', desc: 'Simulate gross weight scale registration' },
    { label: 'Quality Assayer (Grade A)', status: 'QUALITY_APPROVED', desc: 'Simulate moisture & quality grading approval' },
    { label: 'DBT Payment Transfer', status: 'PAYMENT_INITIATED', desc: 'Simulate Accounts desk initiating DBT ₹1,22,300' },
    { label: 'Complete Procurement', status: 'COMPLETED', desc: 'Simulate gate pass clearance & receipt' },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm">
      <div className="bg-slate-950/95 backdrop-blur-md text-white rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden transition-all">
        {/* Header Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold bg-slate-900/80 hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Hackathon Live Demo Simulation</span>
            <span className="text-[10px] font-extrabold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
              {activeBooking.status}
            </span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="p-4 space-y-3 animate-in fade-in duration-150">
            <div className="text-[11px] text-slate-300">
              Simulate checkpoint officer actions for active token{' '}
              <strong className="text-amber-300 font-mono">{activeBooking.token_number}</strong>:
            </div>

            <div className="space-y-1.5">
              {steps.map(s => {
                const isCurrent = activeBooking.status === s.status;
                return (
                  <button
                    key={s.status}
                    disabled={isProcessing}
                    onClick={() => handleTransition(s.status)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-green-600/30 text-green-300 border border-green-500/50'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/50 active:scale-[0.98]'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{s.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                    </div>
                    {isCurrent && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
              <span>Calls Postgres `transition_booking_status()`</span>
              <button
                onClick={() => handleTransition('BOOKED')}
                className="text-amber-400 hover:underline flex items-center gap-1 text-[10px] font-bold"
              >
                <RotateCcw className="w-3 h-3" /> Reset to BOOKED
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
