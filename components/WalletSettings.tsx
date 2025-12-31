"use client";
import { useState } from "react";
import { X, Copy, Check, Eye, EyeOff, Download, AlertTriangle } from "lucide-react";
import { getStoredWalletData, decryptMnemonic } from "@/lib/wallet-generator";

interface WalletSettingsProps {
  address: string;
  onClose: () => void;
}

export default function WalletSettings({ address, onClose }: WalletSettingsProps) {
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>("");

  // Load and decrypt mnemonic
  const loadMnemonic = () => {
    try {
      const encryptedData = getStoredWalletData();
      if (!encryptedData) {
        setError("No wallet data found");
        return;
      }

      const password = "demos-wallet"; // Same password used for encryption
      const decrypted = decryptMnemonic(encryptedData, password);
      setMnemonic(decrypted);
      setShowMnemonic(true);
      setError("");
    } catch (err) {
      setError("Failed to decrypt wallet data");
      console.error("Decryption error:", err);
    }
  };

  const handleCopy = () => {
    if (mnemonic) {
      navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!mnemonic) return;

    const blob = new Blob(
      [
        `Demos Network Wallet Backup\n\n` +
          `Address: ${address}\n\n` +
          `Recovery Phrase:\n${mnemonic}\n\n` +
          `Date: ${new Date().toLocaleString()}\n\n` +
          `IMPORTANT: Keep this recovery phrase safe and never share it with anyone.\n` +
          `Anyone with this phrase can access your wallet and funds.`,
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demos-wallet-backup-${address.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const words = mnemonic ? mnemonic.split(" ") : [];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
      <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full p-8 border border-white/10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Wallet Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Wallet Address */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-2 block">Wallet Address</label>
          <div className="bg-black/40 border border-white/10 rounded-lg px-4 py-3">
            <code className="text-white break-all">{address}</code>
          </div>
        </div>

        {/* Recovery Phrase Section */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-2 block">Recovery Phrase</label>

          {!showMnemonic ? (
            <div className="bg-black/40 border border-white/10 rounded-lg p-8 text-center">
              <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
              <p className="text-gray-400 mb-4">
                Your recovery phrase is hidden for security
              </p>
              <button
                onClick={loadMnemonic}
                className="btn-primary px-6 py-2 flex items-center gap-2 mx-auto"
              >
                <Eye size={18} />
                Show Recovery Phrase
              </button>
            </div>
          ) : (
            <>
              <div className="bg-black/40 border border-white/10 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-3 gap-3">
                  {words.map((word, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-gray-500 text-sm">{index + 1}.</span>
                      <span className="text-white font-mono">{word}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMnemonic(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2
                           bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <EyeOff size={18} />
                  <span>Hide</span>
                </button>
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
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2
                           bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <Download size={18} />
                  <span>Download</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Security Warning */}
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <div className="flex gap-3">
            <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-400">
              <strong>Security Warning:</strong> Never share your recovery phrase with anyone.
              Demos Network will never ask for your recovery phrase. Anyone with access to your
              recovery phrase can steal your funds.
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button onClick={onClose} className="w-full mt-6 btn-secondary py-3">
          Close
        </button>
      </div>
    </div>
  );
}
