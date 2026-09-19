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

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200">
      <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100 relative group min-h-[200px] flex items-center justify-center">
        {securePayload ? (
          <QRCodeSVG
            className="agriq-qr-svg"
            value={securePayload}
            size={size}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#0f172a"
          />
        ) : (
          <div className="animate-pulse w-[180px] h-[180px] bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400 p-4 text-center">
            Waiting for secure pass...
          </div>
        )}
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