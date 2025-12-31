"use client";
import { useState, useEffect } from "react";
import { X, Key, Users, Copy, Check, Eye, EyeOff, Download, AlertTriangle, Loader2 } from "lucide-react";
import { getStoredWalletData, decryptMnemonic } from "@/lib/wallet-generator";
import {
  initiateOAuth,
  initiateTelegramAuth,
  getAllConnections,
  disconnectPlatform,
  type SocialConnection,
} from "@/lib/oauth";

interface SettingsReorganizedProps {
  address: string;
  onClose: () => void;
}

export default function SettingsReorganized({ address, onClose }: SettingsReorganizedProps) {
  const [activeMenu, setActiveMenu] = useState<"backup" | "accounts">("backup");
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>("");

  // Social connections state
  const [connections, setConnections] = useState<Record<string, SocialConnection>>({});
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  // Load stored connections on mount
  useEffect(() => {
    const storedConnections = getAllConnections();
    setConnections(storedConnections);

    // Listen for storage changes (when OAuth completes)
    const handleStorageChange = () => {
      const updatedConnections = getAllConnections();
      setConnections(updatedConnections);
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for updates (for same-window updates)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Load and decrypt mnemonic
  const loadMnemonic = () => {
    try {
      const encryptedData = getStoredWalletData();
      if (!encryptedData) {
        setError("No wallet data found");
        return;
      }

      const password = "demos-wallet";
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
          `IMPORTANT: Keep this recovery phrase safe and never share it with anyone.`,
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

  const connectSocial = async (
    platform: "twitter" | "discord" | "telegram" | "github"
  ) => {
    try {
      setConnectingPlatform(platform);

      if (platform === "telegram") {
        // Telegram uses different auth flow
        initiateTelegramAuth();
      } else {
        // Twitter, Discord, GitHub use OAuth
        await initiateOAuth(platform);
        // Refresh connections after OAuth completes
        const updatedConnections = getAllConnections();
        setConnections(updatedConnections);
      }
    } catch (error: any) {
      console.error(`Failed to connect ${platform}:`, error);
      alert(error.message || `Failed to connect to ${platform}`);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const disconnectSocial = (
    platform: "twitter" | "discord" | "telegram" | "github"
  ) => {
    disconnectPlatform(platform);
    const updatedConnections = getAllConnections();
    setConnections(updatedConnections);
  };

  const words = mnemonic ? mnemonic.split(" ") : [];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#0A0A0A] border border-[#22222299] rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveMenu("backup")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeMenu === "backup"
                ? "text-white border-b-2 border-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Key size={18} />
              <span>Backup Seedphrase</span>
            </div>
          </button>
          <button
            onClick={() => setActiveMenu("accounts")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeMenu === "accounts"
                ? "text-white border-b-2 border-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span>Accounts</span>
            </div>
          </button>
        </div>

        {/* Backup Seedphrase Menu */}
        {activeMenu === "backup" && (
          <div className="space-y-6">
            {/* Wallet Address */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Wallet Address</label>
              <div className="bg-black/40 border border-white/10 rounded-lg px-4 py-3">
                <code className="text-white break-all text-sm">{address}</code>
              </div>
            </div>

            {/* Recovery Phrase */}
            <div>
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
                          <span className="text-white font-mono text-sm">{word}</span>
                        </div>
                      ))}
                    </div>
                  </div>

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

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Security Warning */}
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
              <div className="flex gap-3">
                <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-400">
                  <strong>Security Warning:</strong> Never share your recovery phrase.
                  Anyone with access can steal your funds.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Accounts Menu */}
        {activeMenu === "accounts" && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">
              Connect your social accounts to unlock features and earn contribution points
            </p>

            {/* Twitter */}
            <div className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Twitter / X</p>
                  {connections.twitter?.connected ? (
                    <p className="text-sm text-gray-400">@{connections.twitter.username}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Not connected</p>
                  )}
                </div>
              </div>
              {connections.twitter?.connected ? (
                <button
                  onClick={() => disconnectSocial("twitter")}
                  className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => connectSocial("twitter")}
                  disabled={connectingPlatform === "twitter"}
                  className="px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {connectingPlatform === "twitter" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
                </button>
              )}
            </div>

            {/* Discord */}
            <div className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Discord</p>
                  {connections.discord?.connected ? (
                    <p className="text-sm text-gray-400">{connections.discord.username}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Not connected</p>
                  )}
                </div>
              </div>
              {connections.discord?.connected ? (
                <button
                  onClick={() => disconnectSocial("discord")}
                  className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => connectSocial("discord")}
                  disabled={connectingPlatform === "discord"}
                  className="px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {connectingPlatform === "discord" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
                </button>
              )}
            </div>

            {/* Telegram */}
            <div className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12s12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627c-.168.9-.5 1.201-.82 1.23c-.697.064-1.226-.461-1.901-.903c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.781-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345c-.479.329-.913.489-1.302.481c-.428-.008-1.252-.241-1.865-.44c-.752-.244-1.349-.374-1.297-.789c.027-.216.324-.437.893-.663c3.498-1.524 5.831-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635c.099-.002.321.023.465.14c.121.099.155.232.171.326c.016.093.036.306.02.472z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Telegram</p>
                  {connections.telegram?.connected ? (
                    <p className="text-sm text-gray-400">@{connections.telegram.username}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Not connected</p>
                  )}
                </div>
              </div>
              {connections.telegram?.connected ? (
                <button
                  onClick={() => disconnectSocial("telegram")}
                  className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => connectSocial("telegram")}
                  disabled={connectingPlatform === "telegram"}
                  className="px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {connectingPlatform === "telegram" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
                </button>
              )}
            </div>

            {/* GitHub */}
            <div className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">GitHub</p>
                  {connections.github?.connected ? (
                    <p className="text-sm text-gray-400">@{connections.github.username}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Not connected</p>
                  )}
                </div>
              </div>
              {connections.github?.connected ? (
                <button
                  onClick={() => disconnectSocial("github")}
                  className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => connectSocial("github")}
                  disabled={connectingPlatform === "github"}
                  className="px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {connectingPlatform === "github" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
