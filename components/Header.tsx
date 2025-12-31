"use client";
import { useState, useEffect } from "react";
import { Wallet, Settings, Copy, Check, LogOut } from "lucide-react";
import WalletModal from "./WalletModal";
import SettingsModal from "./SettingsModal";
import HamburgerMenu from "./HamburgerMenu";

interface HeaderProps {
  onNavigate?: (tab: string) => void;
  onHomeClick?: () => void;
}

export default function Header({ onNavigate, onHomeClick }: HeaderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check for existing wallet connection
    const storedAddress = localStorage.getItem("demos_wallet_address");
    const storedMnemonic = localStorage.getItem("demos_wallet_mnemonic");

    if (storedAddress) {
      setAddress(storedAddress);
      setIsConnected(true);
    }

    if (storedMnemonic) {
      setMnemonic(storedMnemonic);
    }
  }, []);

  const handleWalletConnected = (walletAddress: string, walletMnemonic: string) => {
    setAddress(walletAddress);
    setMnemonic(walletMnemonic);
    setIsConnected(true);

    // Store in localStorage
    localStorage.setItem("demos_wallet_address", walletAddress);
    localStorage.setItem("demos_wallet_mnemonic", walletMnemonic);
    localStorage.setItem("demos_wallet_connected", "true");

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new Event("wallet-connected"));

    setShowWalletModal(false);

    // TODO: Create/find Demos identity using MCP and API
    console.log("Wallet connected:", walletAddress);
  };

  const handleDisconnect = () => {
    setAddress(null);
    setMnemonic(null);
    setIsConnected(false);
    setShowWalletDropdown(false);

    // Clear localStorage
    localStorage.removeItem("demos_wallet_address");
    localStorage.removeItem("demos_wallet_mnemonic");
    localStorage.removeItem("demos_wallet_connected");

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new Event("wallet-disconnected"));
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogoClick = () => {
    if (onHomeClick) {
      onHomeClick();
    }
  };

  return (
    <>
      <header className="border-b border-gray-800 bg-black sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-4">
              <HamburgerMenu onNavigate={onNavigate} />
              <button
                onClick={handleLogoClick}
                className="text-2xl font-bold hover:text-gray-300 transition-colors"
              >
                DEMOS
              </button>
            </div>

            {/* Right: Settings + Wallet */}
            <div className="flex items-center gap-3">
              {isConnected && (
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Settings"
                >
                  <Settings size={20} />
                </button>
              )}

              {isConnected ? (
                <div className="relative">
                  <button
                    onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                    className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg font-mono text-sm transition-colors flex items-center gap-2"
                  >
                    <Wallet size={18} />
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </button>

                  {/* Wallet Dropdown */}
                  {showWalletDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowWalletDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 w-80 bg-[#0a0a0a] border border-gray-800 rounded-xl shadow-xl z-20">
                        <div className="p-4 border-b border-gray-800">
                          <p className="text-xs text-gray-500 mb-2">Wallet Address</p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm flex-1 break-all">{address}</p>
                            <button
                              onClick={handleCopyAddress}
                              className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                            >
                              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="p-2">
                          <button
                            onClick={handleDisconnect}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-lg transition-colors text-red-400"
                          >
                            <LogOut size={18} />
                            <span>Disconnect Wallet</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    console.log("Connect Wallet button clicked!");
                    setShowWalletModal(true);
                  }}
                  className="btn-primary flex items-center gap-2 px-6 py-2"
                  type="button"
                >
                  <Wallet size={18} />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onWalletConnected={handleWalletConnected}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        address={address}
        mnemonic={mnemonic}
      />
    </>
  );
}
