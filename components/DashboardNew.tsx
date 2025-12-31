"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Wallet as WalletIcon, Activity, TrendingUp, Twitter, MessageCircle, Send as TelegramIcon, Github, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DemosNodeStatus from "./DemosNodeStatus";
import { getAllConnections } from "@/lib/oauth";

// Mock data for wallet activity chart
const generateMockActivityData = () => {
  const intervals = ['1W', '1M', '3M', '6M', '1Y'];
  return {
    '1W': Array.from({ length: 7 }, (_, i) => ({
      name: `Day ${i + 1}`,
      value: 0,
    })),
    '1M': Array.from({ length: 30 }, (_, i) => ({
      name: `Day ${i + 1}`,
      value: 0,
    })),
    '3M': Array.from({ length: 12 }, (_, i) => ({
      name: `Week ${i + 1}`,
      value: 0,
    })),
    '6M': Array.from({ length: 26 }, (_, i) => ({
      name: `Week ${i + 1}`,
      value: 0,
    })),
    '1Y': Array.from({ length: 12 }, (_, i) => ({
      name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      value: 0,
    })),
  };
};

export default function DashboardNew() {
  const { isConnected, address } = useWallet();
  const [timeInterval, setTimeInterval] = useState<'1W' | '1M' | '3M' | '6M' | '1Y'>('1Y');
  const [activityData] = useState(generateMockActivityData());
  const [mounted, setMounted] = useState(false);

  // Wallet stats (mock data - replace with real data from blockchain)
  const [walletStats, setWalletStats] = useState({
    balance: "0",
    totalTransactions: 0,
  });

  // Social contributions - Load from OAuth connections
  const [contributions, setContributions] = useState({
    twitter: { connected: false, username: "", points: 0 },
    discord: { connected: false, username: "", points: 0 },
    telegram: { connected: false, username: "", points: 0 },
    github: { connected: false, username: "", points: 0 },
  });

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load connected social accounts
  useEffect(() => {
    if (!mounted) return; // Only run on client

    const loadConnections = () => {
      const connections = getAllConnections();

      setContributions({
        twitter: {
          connected: !!connections.twitter,
          username: connections.twitter?.username || "",
          points: connections.twitter ? 100 : 0, // Mock points for now
        },
        discord: {
          connected: !!connections.discord,
          username: connections.discord?.username || "",
          points: connections.discord ? 150 : 0, // Mock points for now
        },
        telegram: {
          connected: !!connections.telegram,
          username: connections.telegram?.username || "",
          points: connections.telegram ? 75 : 0, // Mock points for now
        },
        github: {
          connected: !!connections.github,
          username: connections.github?.username || "",
          points: connections.github ? 200 : 0, // Mock points for now
        },
      });
    };

    loadConnections();

    // Listen for storage changes (when OAuth completes)
    const handleStorageChange = () => {
      loadConnections();
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(loadConnections, 2000); // Check every 2 seconds

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [mounted]);

  const totalPoints = Object.values(contributions).reduce((sum, item) => sum + item.points, 0);
  const hasConnectedAccounts = Object.values(contributions).some(item => item.connected);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <WalletIcon size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect your wallet to view your dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Wallet Activity Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Wallet Activity</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Token Balance */}
          <div className="bg-[#0A0A0A] border border-[#22222299] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Token Balance</h3>
              <WalletIcon size={24} className="text-gray-400" />
            </div>
            <p className="text-3xl font-bold">{walletStats.balance} DEMOS</p>
            <p className="text-sm text-gray-400 mt-2">≈ $0.00 USD</p>
          </div>

          {/* Total Transactions */}
          <div className="bg-[#0A0A0A] border border-[#22222299] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Transactions</h3>
              <Activity size={24} className="text-gray-400" />
            </div>
            <p className="text-3xl font-bold">{walletStats.totalTransactions}</p>
            <p className="text-sm text-gray-400 mt-2">All time</p>
          </div>

          {/* Demos Node Status */}
          <DemosNodeStatus />
        </div>

        {/* Activity Chart */}
        <div className="bg-[#0A0A0A] border border-[#22222299] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Activity Chart</h3>
            <div className="flex gap-2">
              {(['1W', '1M', '3M', '6M', '1Y'] as const).map((interval) => (
                <button
                  key={interval}
                  onClick={() => setTimeInterval(interval)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    timeInterval === interval
                      ? 'bg-white text-black'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-gray-400'
                  }`}
                >
                  {interval}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={activityData[timeInterval]}>
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0A0A0A',
                  border: '1px solid #22222299',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorActivity)"
              />
            </AreaChart>
          </ResponsiveContainer>

          {walletStats.totalTransactions === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">No activity detected yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Contributions Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Contributions</h2>

        {!hasConnectedAccounts ? (
          <div className="bg-[#0A0A0A] border border-[#22222299] rounded-2xl p-12 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No Accounts Connected</h3>
            <p className="text-gray-400 mb-4">
              Connect your social accounts in Settings to start earning contribution points
            </p>
          </div>
        ) : (
          <>
            {/* Social Contribution Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Twitter */}
              <div className="bg-[#0A0A0A] border border-[#22222299] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                    <Twitter size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Twitter</p>
                    {contributions.twitter.connected ? (
                      <p className="text-xs text-gray-400">@{contributions.twitter.username}</p>
                    ) : (
                      <p className="text-xs text-gray-500">Not connected</p>
                    )}
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {contributions.twitter.connected ? contributions.twitter.points : '-'}
                </p>
                <p className="text-xs text-gray-400 mt-1">points</p>
              </div>

              {/* Discord */}
              <div className="bg-[#0A0A0A] border border-[#22222299] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                    <MessageCircle size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Discord</p>
                    {contributions.discord.connected ? (
                      <p className="text-xs text-gray-400">{contributions.discord.username}</p>
                    ) : (
                      <p className="text-xs text-gray-500">Not connected</p>
                    )}
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {contributions.discord.connected ? contributions.discord.points : '-'}
                </p>
                <p className="text-xs text-gray-400 mt-1">points</p>
              </div>

              {/* Telegram */}
              <div className="bg-[#0A0A0A] border border-[#22222299] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                    <TelegramIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Telegram</p>
                    {contributions.telegram.connected ? (
                      <p className="text-xs text-gray-400">@{contributions.telegram.username}</p>
                    ) : (
                      <p className="text-xs text-gray-500">Not connected</p>
                    )}
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {contributions.telegram.connected ? contributions.telegram.points : '-'}
                </p>
                <p className="text-xs text-gray-400 mt-1">points</p>
              </div>

              {/* GitHub */}
              <div className="bg-[#0A0A0A] border border-[#22222299] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                    <Github size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">GitHub</p>
                    {contributions.github.connected ? (
                      <p className="text-xs text-gray-400">@{contributions.github.username}</p>
                    ) : (
                      <p className="text-xs text-gray-500">Not connected</p>
                    )}
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {contributions.github.connected ? contributions.github.points : '-'}
                </p>
                <p className="text-xs text-gray-400 mt-1">points</p>
              </div>
            </div>

            {/* Total Contributions */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Total Contributions</h3>
                  <p className="text-gray-400 text-sm">All platforms combined</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold">{totalPoints}</p>
                  <p className="text-sm text-gray-400">points</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
