"use client";
import { useState, useEffect } from "react";
import { X, Copy, Check, Github, Twitter, MessageCircle, Send as TelegramIcon, AlertCircle, ExternalLink } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string | null;
  mnemonic: string | null;
}

interface OAuthConnection {
  connected: boolean;
  username?: string;
  userId?: string;
  displayName?: string;
}

interface OAuthConnections {
  twitter: OAuthConnection;
  discord: OAuthConnection;
  telegram: OAuthConnection;
  github: OAuthConnection;
}

export default function SettingsModal({ isOpen, onClose, address, mnemonic }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"backup" | "accounts">("backup");
  const [copied, setCopied] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [connections, setConnections] = useState<OAuthConnections>({
    twitter: { connected: false },
    discord: { connected: false },
    telegram: { connected: false },
    github: { connected: false },
  });

  useEffect(() => {
    if (isOpen && address) {
      loadConnections();
    }
  }, [isOpen, address]);

  const loadConnections = () => {
    if (!address) return;

    const stored = localStorage.getItem(`social_connections_${address}`);
    if (stored) {
      try {
        setConnections(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to load connections:", err);
      }
    }
  };

  const saveConnections = (newConnections: OAuthConnections) => {
    if (!address) return;

    localStorage.setItem(`social_connections_${address}`, JSON.stringify(newConnections));
    setConnections(newConnections);
  };

  const handleCopyMnemonic = () => {
    if (mnemonic) {
      navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnectTwitter = async () => {
    // Twitter OAuth flow
    const clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/twitter/callback`;

    if (!clientId) {
      alert("Twitter OAuth is not configured. Please set NEXT_PUBLIC_TWITTER_CLIENT_ID");
      return;
    }

    const state = Math.random().toString(36).substring(7);
    localStorage.setItem("oauth_state", state);

    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20users.read&state=${state}&code_challenge=challenge&code_challenge_method=plain`;

    window.open(authUrl, "twitter-oauth", "width=500,height=600");
  };

  const handleConnectDiscord = async () => {
    // Discord OAuth flow
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/discord/callback`;

    if (!clientId) {
      alert("Discord OAuth is not configured. Please set NEXT_PUBLIC_DISCORD_CLIENT_ID");
      return;
    }

    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;

    window.open(authUrl, "discord-oauth", "width=500,height=600");
  };

  const handleConnectTelegram = () => {
    // Telegram uses a different auth method (widget or bot)
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

    if (!botUsername) {
      alert("Telegram bot is not configured. Please set NEXT_PUBLIC_TELEGRAM_BOT_USERNAME");
      return;
    }

    const authUrl = `https://t.me/${botUsername}?start=connect_${address}`;
    window.open(authUrl, "_blank");
  };

  const handleConnectGithub = async () => {
    // GitHub OAuth flow
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/github/callback`;

    if (!clientId) {
      alert("GitHub OAuth is not configured. Please set NEXT_PUBLIC_GITHUB_CLIENT_ID");
      return;
    }

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user`;

    window.open(authUrl, "github-oauth", "width=500,height=600");
  };

  const handleDisconnect = (platform: keyof OAuthConnections) => {
    const newConnections = {
      ...connections,
      [platform]: { connected: false },
    };
    saveConnections(newConnections);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button onClick={onClose} className="hover:bg-gray-800 p-2 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab("backup")}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === "backup"
                ? "bg-gray-900 border-b-2 border-white"
                : "hover:bg-gray-900/50"
            }`}
          >
            Backup Seed Phrase
          </button>
          <button
            onClick={() => setActiveTab("accounts")}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === "accounts"
                ? "bg-gray-900 border-b-2 border-white"
                : "hover:bg-gray-900/50"
            }`}
          >
            Connected Accounts
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Backup Tab */}
          {activeTab === "backup" && (
            <div className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-yellow-500 font-semibold mb-2">⚠️ Security Warning</p>
                <p className="text-sm text-gray-300">
                  Never share your seed phrase with anyone. Anyone with your seed phrase has full access to your wallet.
                </p>
              </div>

              {mnemonic ? (
                <>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showMnemonic}
                        onChange={(e) => setShowMnemonic(e.target.checked)}
                        className="w-5 h-5"
                      />
                      <span className="text-sm">Show my seed phrase</span>
                    </label>
                  </div>

                  {showMnemonic && (
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {mnemonic.split(" ").map((word, index) => (
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
                  )}

                  {!showMnemonic && (
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center">
                      <p className="text-gray-400">Your seed phrase is hidden for security</p>
                      <p className="text-sm text-gray-500 mt-2">Check the box above to reveal it</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 mt-0.5" />
                  <div>
                    <p className="text-red-500 font-semibold">Seed phrase not available</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Your wallet was connected without storing the seed phrase. This usually happens when importing via browser wallet.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Accounts Tab */}
          {activeTab === "accounts" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400 mb-6">
                Connect your social accounts to track contributions and participate in the Demos community.
              </p>

              {/* Twitter */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-3 rounded-lg">
                      <Twitter size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">X (Twitter)</h3>
                      {connections.twitter.connected ? (
                        <p className="text-sm text-gray-400">@{connections.twitter.username}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Not connected</p>
                      )}
                    </div>
                  </div>
                  {connections.twitter.connected ? (
                    <button
                      onClick={() => handleDisconnect("twitter")}
                      className="btn-secondary text-sm"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button onClick={handleConnectTwitter} className="btn-primary text-sm flex items-center gap-2">
                      Connect
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Discord */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/10 p-3 rounded-lg">
                      <MessageCircle size={24} className="text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Discord</h3>
                      {connections.discord.connected ? (
                        <p className="text-sm text-gray-400">{connections.discord.displayName}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Not connected</p>
                      )}
                    </div>
                  </div>
                  {connections.discord.connected ? (
                    <button
                      onClick={() => handleDisconnect("discord")}
                      className="btn-secondary text-sm"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button onClick={handleConnectDiscord} className="btn-primary text-sm flex items-center gap-2">
                      Connect
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Telegram */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-400/10 p-3 rounded-lg">
                      <TelegramIcon size={24} className="text-blue-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Telegram</h3>
                      {connections.telegram.connected ? (
                        <p className="text-sm text-gray-400">{connections.telegram.displayName}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Not connected</p>
                      )}
                    </div>
                  </div>
                  {connections.telegram.connected ? (
                    <button
                      onClick={() => handleDisconnect("telegram")}
                      className="btn-secondary text-sm"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button onClick={handleConnectTelegram} className="btn-primary text-sm flex items-center gap-2">
                      Connect
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* GitHub */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-500/10 p-3 rounded-lg">
                      <Github size={24} className="text-gray-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold">GitHub</h3>
                      {connections.github.connected ? (
                        <p className="text-sm text-gray-400">@{connections.github.username}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Not connected</p>
                      )}
                    </div>
                  </div>
                  {connections.github.connected ? (
                    <button
                      onClick={() => handleDisconnect("github")}
                      className="btn-secondary text-sm"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button onClick={handleConnectGithub} className="btn-primary text-sm flex items-center gap-2">
                      Connect
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mt-6">
                <p className="text-sm text-gray-300">
                  💡 <strong>Note:</strong> OAuth connections require environment variables to be configured.
                  Check the documentation for setup instructions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
