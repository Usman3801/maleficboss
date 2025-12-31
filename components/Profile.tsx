"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { User, Github, Twitter, Send as TelegramIcon, Link as LinkIcon, CheckCircle, Loader2 } from "lucide-react";

export default function Profile() {
  const { isConnected, address } = useWallet();
  const [connections, setConnections] = useState({
    github: { connected: false, username: "" },
    twitter: { connected: false, username: "" },
    telegram: { connected: false, username: "" },
  });
  const [loading, setLoading] = useState({ github: false, twitter: false, telegram: false });

  // Check for OAuth callbacks
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      // Handle OAuth callback
      handleOAuthCallback(state, code);
    }
  }, []);

  const handleOAuthCallback = async (provider: string, code: string) => {
    // Process OAuth callback
    console.log(`OAuth callback from ${provider} with code:`, code);
  };

  const connectGitHub = async () => {
    setLoading({ ...loading, github: true });
    try {
      // In production, redirect to GitHub OAuth
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'demo_client_id';
      const redirectUri = `${window.location.origin}/profile`;
      const scope = 'read:user';
      const state = 'github';

      // For demo purposes, simulate connection
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setConnections({
        ...connections,
        github: { connected: true, username: "demo_user" }
      });

      // In production, uncomment:
      // window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    } catch (error) {
      console.error('GitHub connection error:', error);
    } finally {
      setLoading({ ...loading, github: false });
    }
  };

  const connectTwitter = async () => {
    setLoading({ ...loading, twitter: true });
    try {
      // For demo purposes
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setConnections({
        ...connections,
        twitter: { connected: true, username: "@demo_user" }
      });
    } catch (error) {
      console.error('Twitter connection error:', error);
    } finally {
      setLoading({ ...loading, twitter: false });
    }
  };

  const connectTelegram = async () => {
    setLoading({ ...loading, telegram: true });
    try {
      // For demo purposes
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setConnections({
        ...connections,
        telegram: { connected: true, username: "@demo_user" }
      });
    } catch (error) {
      console.error('Telegram connection error:', error);
    } finally {
      setLoading({ ...loading, telegram: false });
    }
  };

  const disconnect = (platform: 'github' | 'twitter' | 'telegram') => {
    setConnections({
      ...connections,
      [platform]: { connected: false, username: "" }
    });
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect wallet to manage your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Profile & Social Connections</h2>

      {/* Wallet Info */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white to-gray-500 flex items-center justify-center">
            <User size={32} className="text-black" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Wallet Address</h3>
            <p className="font-mono text-sm text-gray-400">{address}</p>
          </div>
        </div>
      </div>

      {/* Social Connections */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-4">Connect Your Socials</h3>

        {/* GitHub */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Github size={24} />
              </div>
              <div>
                <h4 className="font-bold">GitHub</h4>
                {connections.github.connected ? (
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    Connected as {connections.github.username}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Not connected</p>
                )}
              </div>
            </div>
            {connections.github.connected ? (
              <button
                onClick={() => disconnect('github')}
                className="btn-secondary"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={connectGitHub}
                disabled={loading.github}
                className="btn-primary flex items-center gap-2"
              >
                {loading.github ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon size={16} />
                    <span>Connect</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Twitter/X */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Twitter size={24} />
              </div>
              <div>
                <h4 className="font-bold">X (Twitter)</h4>
                {connections.twitter.connected ? (
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    Connected as {connections.twitter.username}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Not connected</p>
                )}
              </div>
            </div>
            {connections.twitter.connected ? (
              <button
                onClick={() => disconnect('twitter')}
                className="btn-secondary"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={connectTwitter}
                disabled={loading.twitter}
                className="btn-primary flex items-center gap-2"
              >
                {loading.twitter ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon size={16} />
                    <span>Connect</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Telegram */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <TelegramIcon size={24} />
              </div>
              <div>
                <h4 className="font-bold">Telegram</h4>
                {connections.telegram.connected ? (
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    Connected as {connections.telegram.username}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Not connected</p>
                )}
              </div>
            </div>
            {connections.telegram.connected ? (
              <button
                onClick={() => disconnect('telegram')}
                className="btn-secondary"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={connectTelegram}
                disabled={loading.telegram}
                className="btn-primary flex items-center gap-2"
              >
                {loading.telegram ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon size={16} />
                    <span>Connect</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="card mt-8">
        <h3 className="font-bold mb-4">Why Connect Your Socials?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-white">✓</span>
            <span className="text-gray-300">Track your contributions automatically</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-white">✓</span>
            <span className="text-gray-300">Earn rewards for community engagement</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-white">✓</span>
            <span className="text-gray-300">Get verified contributor status</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-white">✓</span>
            <span className="text-gray-300">Access exclusive features</span>
          </div>
        </div>
      </div>
    </div>
  );
}
