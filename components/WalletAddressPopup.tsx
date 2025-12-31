"use client";
import { useState } from "react";
import { Copy, Check, LogOut, X } from "lucide-react";

interface WalletAddressPopupProps {
  address: string;
  onDisconnect: () => void;
  onClose: () => void;
}

export default function WalletAddressPopup({
  address,
  onDisconnect,
  onClose,
}: WalletAddressPopupProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0A0A0A] border border-[#22222299] rounded-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h3 className="text-xl font-semibold mb-6">Wallet Address</h3>

        {/* Address Display */}
        <div className="mb-6">
          <div className="bg-black/40 border border-white/10 rounded-lg p-4 mb-4">
            <code className="text-sm break-all text-gray-300">{address}</code>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 px-4 py-3
                     bg-white text-black hover:bg-gray-100 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check size={18} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={18} />
                <span>Copy Address</span>
              </>
            )}
          </button>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={() => {
            onDisconnect();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3
                   bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg
                   transition-colors border border-red-500/20"
        >
          <LogOut size={18} />
          <span>Disconnect Wallet</span>
        </button>
      </div>
    </div>
  );
}
