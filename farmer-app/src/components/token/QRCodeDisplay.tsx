import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
  tokenNumber: string;
  bookingId: string;
  farmerId: string;
  centerId: string;
  phoneNumber?: string;
  slotDate?: string;
  size?: number;
  securePayload?: string; 
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  tokenNumber,
  bookingId,
  farmerId,
  centerId,
  phoneNumber,
  slotDate,
  size = 180,
  securePayload,
}) => {
  const [copied, setCopied] = useState(false);

  // No caller in this app currently passes securePayload (a prior change
  // introduced the prop but nothing populates it), which left the QR code
  // stuck on "Waiting for secure pass..." permanently. Falling back to the
  // same plain-JSON payload the officer scanner already expects keeps this
  // working today; a real signed payload can replace this fallback later
  // without changing the component's public interface.
  const effectivePayload = securePayload || JSON.stringify({
    type: 'AGRIQ_TOKEN',
    booking_id: bookingId,
    token_number: tokenNumber,
    token: tokenNumber, // backward compatibility
    farmer_id: farmerId,
    center_id: centerId,
    phone_number: phoneNumber || '',
    slot_date: slotDate || new Date().toISOString().split('T')[0],
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200">
      <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100 relative group min-h-[200px] flex items-center justify-center">
        <QRCodeSVG
          className="agriq-qr-svg"
          value={effectivePayload}
          size={size}
          level="H"
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#0f172a"
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="font-mono text-sm font-black text-slate-800 tracking-wider">
          {tokenNumber}
        </span>
        <button
          onClick={handleCopy}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Copy Token Number"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <p className="text-[10px] text-slate-400 text-center mt-1 font-medium flex items-center gap-1">
        <QrCode className="w-3 h-3 text-slate-400" />
        Scan at Mandi Entrance Gate Checkpoint
      </p>
    </div>
  );
};