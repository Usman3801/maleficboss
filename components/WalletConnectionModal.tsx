"use client";
import { useState } from "react";
import { X, Wallet as WalletIcon, FileText, Shield } from "lucide-react";

interface WalletConnectionModalProps {
  onGenerate: () => void;
  onImportMnemonic: () => void;
  onClose: () => void;
}

export default function WalletConnectionModal({
  onGenerate,
  onImportMnemonic,
  onClose,
}: WalletConnectionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
      <div className="bg-[#0A0A0A] border border-[#22222299] rounded-2xl max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <WalletIcon size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Welcome to your identity hub
          </h2>
          <p className="text-gray-400 text-sm">
            Please connect your wallet to continue
          </p>
        </div>

        {/* Connection Options */}
        <div className="space-y-4">
          {/* Generate New Wallet */}
          <button
            onClick={onGenerate}
            className="w-full p-5 bg-white hover:bg-gray-100 text-black rounded-xl
                     transition-all group border border-transparent hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield size={20} />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-lg mb-1">Generate Wallet</div>
                <div className="text-sm text-gray-600">
                  Create a new wallet with a secure 12-word recovery phrase
                </div>
              </div>
            </div>
          </button>

          {/* Import Existing Wallet */}
          <button
            onClick={onImportMnemonic}
            className="w-full p-5 bg-[#1A1D24] hover:bg-[#22252C] text-white rounded-xl
                     transition-all group border border-[#22222299] hover:border-white/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={20} />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-lg mb-1">Import Wallet</div>
                <div className="text-sm text-gray-400">
                  Use your existing 12-word recovery phrase to restore your wallet
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By connecting, you agree to Demos Network's{" "}
            <a href="#" className="text-white hover:underline">
              Terms of Service
            </a>
          </p>
        </div>

        {/* Social Links */}
        <div className="mt-6 flex justify-center gap-4">
          <a
            href="https://x.com/demos_network"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://discord.gg/SdRqbKEcEJ"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </a>
          <a
            href="https://t.me/demos_network"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12s12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627c-.168.9-.5 1.201-.82 1.23c-.697.064-1.226-.461-1.901-.903c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.781-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345c-.479.329-.913.489-1.302.481c-.428-.008-1.252-.241-1.865-.44c-.752-.244-1.349-.374-1.297-.789c.027-.216.324-.437.893-.663c3.498-1.524 5.831-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635c.099-.002.321.023.465.14c.121.099.155.232.171.326c.016.093.036.306.02.472z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
