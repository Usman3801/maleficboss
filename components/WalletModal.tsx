"use client";
import { useState } from "react";
import { X, ArrowLeft, Copy, Check, AlertCircle } from "lucide-react";
import { generateWallet, importWalletFromMnemonic, validateMnemonic } from "@/lib/wallet-generator";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected: (address: string, mnemonic: string) => void;
}

export default function WalletModal({ isOpen, onClose, onWalletConnected }: WalletModalProps) {
  const [view, setView] = useState<"main" | "generate" | "import">("main");
  const [generatedMnemonic, setGeneratedMnemonic] = useState<string>("");
  const [importWords, setImportWords] = useState<string[]>(Array(12).fill(""));
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateSeed = () => {
    try {
      const wallet = generateWallet();
      setGeneratedMnemonic(wallet.mnemonic);
      setView("generate");
      setError("");
    } catch (err) {
      setError("Failed to generate wallet");
    }
  };

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(generatedMnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinueWithGenerated = () => {
    try {
      const wallet = importWalletFromMnemonic(generatedMnemonic);
      onWalletConnected(wallet.address, wallet.mnemonic);
      resetModal();
    } catch (err) {
      setError("Failed to create wallet");
    }
  };

  const handleImportWordChange = (index: number, value: string) => {
    const newWords = [...importWords];
    newWords[index] = value.trim().toLowerCase();
    setImportWords(newWords);
    setError("");
  };

  const handlePasteAll = (e: React.ClipboardEvent, index: number) => {
    const pastedText = e.clipboardData.getData("text");
    const words = pastedText.trim().split(/\s+/);

    if (words.length === 12) {
      e.preventDefault();
      setImportWords(words.map(w => w.toLowerCase()));
    }
  };

  const handleImportSeed = () => {
    try {
      const mnemonic = importWords.join(" ");

      if (!validateMnemonic(mnemonic)) {
        setError("Invalid seed phrase. Please check your 12 words.");
        return;
      }

      const wallet = importWalletFromMnemonic(mnemonic);
      onWalletConnected(wallet.address, wallet.mnemonic);
      resetModal();
    } catch (err) {
      setError("Failed to import wallet. Please check your seed phrase.");
    }
  };

  const resetModal = () => {
    setView("main");
    setGeneratedMnemonic("");
    setImportWords(Array(12).fill(""));
    setError("");
    setCopied(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {view !== "main" && (
              <button onClick={() => setView("main")} className="hover:bg-gray-800 p-2 rounded-lg">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-2xl font-bold">
              {view === "main" && "Connect Wallet"}
              {view === "generate" && "Backup Seed Phrase"}
              {view === "import" && "Import Seed Phrase"}
            </h2>
          </div>
          <button onClick={handleClose} className="hover:bg-gray-800 p-2 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {/* Main View */}
          {view === "main" && (
            <div className="space-y-4">
              <button
                onClick={handleGenerateSeed}
                className="w-full p-6 bg-white text-black hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors"
              >
                Generate Seed Phrase
              </button>
              <button
                onClick={() => setView("import")}
                className="w-full p-6 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-lg transition-colors"
              >
                Import Seed Phrase
              </button>
              <p className="text-sm text-gray-400 text-center mt-4">
                Choose to generate a new wallet or import an existing one using your 12-word seed phrase
              </p>
            </div>
          )}

          {/* Generate View */}
          {view === "generate" && generatedMnemonic && (
            <div className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-yellow-500 font-semibold mb-2">⚠️ Important: Backup Your Seed Phrase</p>
                <p className="text-sm text-gray-300">
                  Write down these 12 words in order and store them safely. You'll need them to recover your wallet.
                  Never share your seed phrase with anyone!
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {generatedMnemonic.split(" ").map((word, index) => (
                    <div key={index} className="bg-gray-800 p-3 rounded-lg">
                      <span className="text-gray-500 text-xs">{index + 1}.</span>
                      <span className="ml-2 font-mono">{word}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleCopyMnemonic}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-gray-900 border border-gray-700 rounded-lg cursor-pointer">
                  <input type="checkbox" id="backup-confirm" className="w-5 h-5" />
                  <span className="text-sm">I have securely backed up my seed phrase</span>
                </label>
              </div>

              <button
                onClick={handleContinueWithGenerated}
                className="w-full btn-primary py-4 text-lg font-semibold"
                disabled={!(document.getElementById("backup-confirm") as HTMLInputElement)?.checked}
              >
                Continue to Dashboard
              </button>
            </div>
          )}

          {/* Import View */}
          {view === "import" && (
            <div className="space-y-6">
              <p className="text-gray-400 text-sm">
                Enter your 12-word seed phrase to import your wallet. You can paste all words at once in any field.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {importWords.map((word, index) => (
                  <div key={index}>
                    <label className="text-xs text-gray-500 mb-1 block">{index + 1}</label>
                    <input
                      type="text"
                      value={word}
                      onChange={(e) => handleImportWordChange(index, e.target.value)}
                      onPaste={(e) => handlePasteAll(e, index)}
                      placeholder={`Word ${index + 1}`}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 font-mono text-sm focus:border-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleImportSeed}
                className="w-full btn-primary py-4 text-lg font-semibold"
                disabled={importWords.some(w => !w)}
              >
                Import Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
