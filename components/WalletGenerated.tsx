"use client";
import { useState } from "react";
import { Copy, Check, Eye, EyeOff, Download } from "lucide-react";

interface WalletGeneratedProps {
  address: string;
  mnemonic: string;
  onContinue: () => void;
}

export default function WalletGenerated({ address, mnemonic, onContinue }: WalletGeneratedProps) {
  const [copied, setCopied] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(true);

  const words = mnemonic.split(" ");

  const handleCopy = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob(
      [
        `Demos Network Wallet\n\n` +
          `Address: ${address}\n\n` +
          `Recovery Phrase:\n${mnemonic}\n\n` +
          `IMPORTANT: Keep this recovery phrase safe and never share it with anyone.`,
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demos-wallet-${address.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full p-8 border border-white/10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Wallet Created Successfully!</h2>
          <p className="text-gray-400">Your new Demos Network wallet is ready</p>
        </div>

        {/* Wallet Address */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-2 block">Wallet Address</label>
          <div className="bg-black/40 border border-white/10 rounded-lg px-4 py-3">
            <code className="text-white break-all">{address}</code>
          </div>
        </div>

        {/* Recovery Phrase */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-400">Recovery Phrase (12 words)</label>
            <button
              onClick={() => setShowMnemonic(!showMnemonic)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showMnemonic ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-lg p-4 mb-4">
            {showMnemonic ? (
              <div className="grid grid-cols-3 gap-3">
                {words.map((word, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-gray-500 text-sm">{index + 1}.</span>
                    <span className="text-white font-mono">{word}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                Recovery phrase hidden for security
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2
                       bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>Copy Phrase</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2
                       bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <Download size={18} />
              <span>Download Backup</span>
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">
            <strong>⚠️ Important:</strong> Write down your recovery phrase and store it in a safe place.
            You'll need it to recover your wallet. Never share it with anyone!
          </p>
        </div>

        {/* Continue button */}
        <button onClick={onContinue} className="w-full btn-primary py-3">
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}
