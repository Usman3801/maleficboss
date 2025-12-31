"use client";
import { Wallet, Settings } from "lucide-react";
import { useState } from "react";
import {
  generateWallet,
  importWalletFromMnemonic,
  storeWalletData,
  clearWalletData,
  encryptMnemonic,
} from "@/lib/wallet-generator";
import { useWallet } from "@/contexts/WalletContext";
import { getOrCreateDemosIdentity, storeDemosIdentity } from "@/lib/demos-api";
import WalletConnectionModal from "./WalletConnectionModal";
import MnemonicImport from "./MnemonicImport";
import WalletGenerated from "./WalletGenerated";
import SettingsReorganized from "./SettingsReorganized";
import WalletAddressPopup from "./WalletAddressPopup";
import HamburgerMenu from "./HamburgerMenu";

interface HeaderProps {
  onNavigate?: (tab: string) => void;
  currentTab?: string;
}

export default function Header({ onNavigate, currentTab }: HeaderProps) {
  const { isConnected, address, setWalletConnected, setWalletDisconnected } = useWallet();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showMnemonicImport, setShowMnemonicImport] = useState(false);
  const [showWalletGenerated, setShowWalletGenerated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [generatedWallet, setGeneratedWallet] = useState<{
    address: string;
    mnemonic: string;
  } | null>(null);

  // Generate new wallet
  const handleGenerate = async () => {
    try {
      const wallet = generateWallet();

      // Store wallet data (encrypted with a simple password for now)
      const password = "demos-wallet"; // In production, get this from user
      const encrypted = encryptMnemonic(wallet.mnemonic, password);
      storeWalletData(wallet.address, encrypted);

      // Create or get Demos identity from the mnemonic
      try {
        const demosIdentity = await getOrCreateDemosIdentity(wallet.mnemonic);
        storeDemosIdentity(demosIdentity);
        console.log("✅ Demos identity ready:", demosIdentity.address);
      } catch (demosError) {
        console.error("⚠️ Failed to setup Demos identity:", demosError);
        // Continue even if Demos identity creation fails
      }

      setGeneratedWallet({
        address: wallet.address,
        mnemonic: wallet.mnemonic,
      });
      setShowConnectionModal(false);
      setShowWalletGenerated(true);
    } catch (error) {
      console.error("Failed to generate wallet:", error);
      alert("Failed to generate wallet. Please try again.");
    }
  };

  // Import wallet from mnemonic
  const handleImport = async (mnemonic: string) => {
    try {
      const wallet = importWalletFromMnemonic(mnemonic);

      // Store wallet data
      const password = "demos-wallet";
      const encrypted = encryptMnemonic(wallet.mnemonic, password);
      storeWalletData(wallet.address, encrypted);

      // Check or create Demos identity from the imported mnemonic
      try {
        const demosIdentity = await getOrCreateDemosIdentity(wallet.mnemonic);
        storeDemosIdentity(demosIdentity);

        if (demosIdentity.exists) {
          console.log("✅ Existing Demos identity found:", demosIdentity.address);
        } else {
          console.log("✅ New Demos identity created:", demosIdentity.address);
        }

        setWalletConnected(wallet.address, demosIdentity.address);
      } catch (demosError) {
        console.error("⚠️ Failed to setup Demos identity:", demosError);
        // Continue even if Demos identity creation fails
        setWalletConnected(wallet.address);
      }

      setShowMnemonicImport(false);
    } catch (error: any) {
      console.error("Failed to import wallet:", error);
      throw error; // Let MnemonicImport component handle the error
    }
  };

  // Continue to dashboard after wallet generation
  const handleContinueToDashboard = async () => {
    if (generatedWallet) {
      // Get Demos identity from storage
      try {
        const { getStoredDemosIdentity } = await import("@/lib/demos-api");
        const demosIdentity = getStoredDemosIdentity();

        if (demosIdentity) {
          setWalletConnected(generatedWallet.address, demosIdentity.address);
        } else {
          setWalletConnected(generatedWallet.address);
        }
      } catch (error) {
        console.error("Failed to get Demos identity:", error);
        setWalletConnected(generatedWallet.address);
      }

      setShowWalletGenerated(false);
      setGeneratedWallet(null);
    }
  };

  // Disconnect wallet
  const handleDisconnect = async () => {
    clearWalletData();

    // Clear Demos identity
    try {
      const { clearDemosIdentity } = await import("@/lib/demos-api");
      clearDemosIdentity();
    } catch (error) {
      console.error("Error clearing Demos identity:", error);
    }

    setWalletDisconnected();
  };

  // Open settings
  const handleSettings = () => {
    setShowSettings(true);
  };

  return (
    <>
      <header className="border-b border-border bg-black sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu */}
              {onNavigate && currentTab && (
                <HamburgerMenu onNavigate={onNavigate} currentTab={currentTab} />
              )}
            </div>
            <div className="flex items-center space-x-3">
              {isConnected ? (
                <>
                  {/* Account Name with Disconnect and Settings */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDisconnect}
                      className="px-3 py-2 bg-red-900/20 text-red-400 rounded-lg border border-red-900/50 text-sm hover:bg-red-900/30 transition-colors"
                    >
                      Disconnect
                    </button>
                    <button
                      onClick={() => setShowAddressPopup(true)}
                      className="px-4 py-2 bg-secondary rounded-lg border border-border text-sm hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Wallet size={16} />
                        <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                      </div>
                    </button>
                    <button
                      onClick={handleSettings}
                      className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Settings"
                    >
                      <Settings size={20} className="text-gray-400 hover:text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowConnectionModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Wallet size={18} />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Connection Modal - Generate or Import */}
      {showConnectionModal && (
        <WalletConnectionModal
          onGenerate={handleGenerate}
          onImportMnemonic={() => {
            setShowConnectionModal(false);
            setShowMnemonicImport(true);
          }}
          onClose={() => setShowConnectionModal(false)}
        />
      )}

      {/* Mnemonic Import Modal */}
      {showMnemonicImport && (
        <MnemonicImport
          onImport={handleImport}
          onClose={() => setShowMnemonicImport(false)}
        />
      )}

      {/* Wallet Generated Modal */}
      {showWalletGenerated && generatedWallet && (
        <WalletGenerated
          address={generatedWallet.address}
          mnemonic={generatedWallet.mnemonic}
          onContinue={handleContinueToDashboard}
        />
      )}

      {/* Wallet Address Popup */}
      {showAddressPopup && isConnected && address && (
        <WalletAddressPopup
          address={address}
          onDisconnect={handleDisconnect}
          onClose={() => setShowAddressPopup(false)}
        />
      )}

      {/* Wallet Settings Modal */}
      {showSettings && isConnected && address && (
        <SettingsReorganized address={address} onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
