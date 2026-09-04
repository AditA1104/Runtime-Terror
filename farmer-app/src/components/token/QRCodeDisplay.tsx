import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
  tokenNumber: string;
  bookingId: string;
  farmerId: string;
  centerId: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  tokenNumber,
  bookingId,
  farmerId,
  centerId,
  size = 180,
}) => {
  const [copied, setCopied] = useState(false);

  // Payload scanned by Mandi Officer scanner app
  const qrPayload = JSON.stringify({
    type: 'AGRIQ_TOKEN',
    token: tokenNumber,
    booking_id: bookingId,
    farmer_id: farmerId,
    center_id: centerId,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200">
      <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100 relative group">
        <QRCodeSVG
          className="agriq-qr-svg"
          value={qrPayload}
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
