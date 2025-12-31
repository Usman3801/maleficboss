"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { autoArrangeMnemonic, validateMnemonic, joinMnemonic } from "@/lib/wallet-generator";

interface MnemonicImportProps {
  onImport: (mnemonic: string) => Promise<void>;
  onClose: () => void;
}

export default function MnemonicImport({ onImport, onClose }: MnemonicImportProps) {
  const [words, setWords] = useState<string[]>(Array(12).fill(""));
  const [error, setError] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);

  // Handle paste in first box - auto-arrange if all 12 words pasted
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    if (index !== 0) return; // Only handle paste in first box

    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const arrangedWords = autoArrangeMnemonic(pastedText);

    if (arrangedWords.length === 12) {
      setWords(arrangedWords);
      setError("");
    } else {
      // If not exactly 12 words, just paste in the current box
      const newWords = [...words];
      newWords[index] = pastedText.trim();
      setWords(newWords);
    }
  };

  // Handle individual word input
  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value.trim().toLowerCase();
    setWords(newWords);
    setError("");
  };

  // Handle import
  const handleImport = async () => {
    setError("");

    // Check if all words are filled
    const allFilled = words.every((word) => word.length > 0);
    if (!allFilled) {
      setError("Please fill in all 12 words");
      return;
    }

    // Join words and validate
    const mnemonic = joinMnemonic(words);
    const isValid = validateMnemonic(mnemonic);

    if (!isValid) {
      setError("Invalid mnemonic phrase. Please check your words.");
      return;
    }

    setIsImporting(true);
    try {
      await onImport(mnemonic);
    } catch (err: any) {
      setError(err.message || "Failed to import wallet");
      setIsImporting(false);
    }
  };

  // Clear all words
  const handleClear = () => {
    setWords(Array(12).fill(""));
    setError("");
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full p-8 border border-white/10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Import Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Instructions */}
        <p className="text-gray-400 mb-6">
          Enter your 12-word recovery phrase. You can paste all words in the first box to auto-fill.
        </p>

        {/* 12-word grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {words.map((word, index) => (
            <div key={index} className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                {index + 1}.
              </span>
              <input
                type="text"
                value={word}
                onChange={(e) => handleWordChange(index, e.target.value)}
                onPaste={(e) => handlePaste(e, index)}
                placeholder={`Word ${index + 1}`}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-3 pl-10
                         text-white placeholder-gray-600 focus:border-white/30 focus:outline-none
                         transition-colors"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleClear}
            className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg
                     transition-colors text-white font-medium"
          >
            Clear All
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? "Importing..." : "Import Wallet"}
          </button>
        </div>

        {/* Security note */}
        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-400 text-sm">
            <strong>Security Note:</strong> Never share your recovery phrase with anyone.
            Demos Network will never ask for your recovery phrase.
          </p>
        </div>
      </div>
    </div>
  );
}
