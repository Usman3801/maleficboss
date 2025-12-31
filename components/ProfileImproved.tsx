"use client";
import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { User, CheckCircle, Wallet as WalletIcon, Copy, Check } from "lucide-react";

export default function ProfileImproved() {
  const { isConnected, address } = useWallet();
  const [copied, setCopied] = useState(false);
  const [connections, setConnections] = useState({
    twitter: { connected: false, username: "" },
    discord: { connected: false, username: "" },
    telegram: { connected: false, username: "" },
    github: { connected: false, username: "" },
  });

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const connectSocial = async (platform: string) => {
    // Simulate connection - in production, this would trigger OAuth
    const username = prompt(`Enter your ${platform} username:`);
    if (username) {
      setConnections({
        ...connections,
        [platform]: { connected: true, username },
      });
    }
  };

  const disconnectSocial = (platform: string) => {
    setConnections({
      ...connections,
      [platform]: { connected: false, username: "" },
    });
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <WalletIcon size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect your wallet to access your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Your Identity Hub</h2>
        <p className="text-gray-400">Manage your wallet and connected accounts</p>
      </div>

      {/* Wallet Info Card */}
      <div className="bg-[#0A0A0A] border border-[#22222299] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Wallet Address</h3>
          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
            <WalletIcon size={20} className="text-white" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-sm bg-black/40 border border-white/10 rounded-lg px-4 py-3">
            {address}
          </code>
          <button
            onClick={handleCopyAddress}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
          </button>
        </div>
      </div>

      {/* Social Connections */}
      <div className="bg-[#0A0A0A] border border-[#22222299] rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-6">Connected Accounts</h3>
        <div className="space-y-4">
          {/* Twitter/X */}
          <div className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Twitter / X</p>
                {connections.twitter.connected ? (
                  <p className="text-sm text-gray-400">@{connections.twitter.username}</p>
                ) : (
                  <p className="text-sm text-gray-500">Not connected</p>
                )}
              </div>
            </div>
            {connections.twitter.connected ? (
              <button
                onClick={() => disconnectSocial("twitter")}
                className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => connectSocial("twitter")}
                className="px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-lg transition-colors"
              >
                Connect
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
                {connections.discord.connected ? (
                  <p className="text-sm text-gray-400">{connections.discord.username}</p>
                ) : (
                  <p className="text-sm text-gray-500">Not connected</p>
                )}
              </div>
            </div>
            {connections.discord.connected ? (
              <button
                onClick={() => disconnectSocial("discord")}
                className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => connectSocial("discord")}
                className="px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-lg transition-colors"
              >
                Connect
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
                {connections.telegram.connected ? (
                  <p className="text-sm text-gray-400">@{connections.telegram.username}</p>
                ) : (
                  <p className="text-sm text-gray-500">Not connected</p>
                )}
              </div>
            </div>
            {connections.telegram.connected ? (
              <button
                onClick={() => disconnectSocial("telegram")}
                className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => connectSocial("telegram")}
                className="px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-lg transition-colors"
              >
                Connect
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
                {connections.github.connected ? (
                  <p className="text-sm text-gray-400">@{connections.github.username}</p>
                ) : (
                  <p className="text-sm text-gray-500">Not connected</p>
                )}
              </div>
            </div>
            {connections.github.connected ? (
              <button
                onClick={() => disconnectSocial("github")}
                className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => connectSocial("github")}
                className="px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-lg transition-colors"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Connected accounts help improve your Demos Network experience and unlock additional features.</p>
      </div>
    </div>
  );
}
