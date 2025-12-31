"use client";
import { useState, useEffect } from "react";
import { Wallet, TrendingUp, Activity, Github, MessageCircle, Twitter, Send as TelegramIcon, Trophy } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { JsonRpcProvider } from "ethers";

interface WalletStats {
  balance: string;
  transactions: number;
}

interface ContributionStats {
  twitter: { connected: boolean; username?: string; points: number };
  discord: { connected: boolean; displayName?: string; points: number };
  telegram: { connected: boolean; displayName?: string; points: number };
  github: { connected: boolean; username?: string; points: number };
  total: number;
}

export default function Dashboard() {
  const { isConnected, address } = useWalletConnection();
  const [walletStats, setWalletStats] = useState<WalletStats>({ balance: "0", transactions: 0 });
  const [contributions, setContributions] = useState<ContributionStats>({
    twitter: { connected: false, points: 0 },
    discord: { connected: false, points: 0 },
    telegram: { connected: false, points: 0 },
    github: { connected: false, points: 0 },
    total: 0,
  });
  const [activityData, setActivityData] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      fetchWalletData();
      loadContributions();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const fetchWalletData = async () => {
    if (!address) return;

    try {
      // Connect to Demos Network
      const provider = new JsonRpcProvider("https://testnet-rpc.demos.network");

      // Get balance
      const balance = await provider.getBalance(address);
      const balanceInDEM = (Number(balance) / 1e18).toFixed(4);

      // Get transaction count
      const txCount = await provider.getTransactionCount(address);

      setWalletStats({
        balance: balanceInDEM,
        transactions: txCount,
      });

      // Generate activity chart based on real transaction count
      // If no transactions, show zeros
      if (txCount === 0) {
        setActivityData([
          { name: "Mon", value: 0 },
          { name: "Tue", value: 0 },
          { name: "Wed", value: 0 },
          { name: "Thu", value: 0 },
          { name: "Fri", value: 0 },
          { name: "Sat", value: 0 },
          { name: "Sun", value: 0 },
        ]);
      } else {
        // Simple distribution of transactions over the week
        const avgPerDay = txCount / 7;
        setActivityData([
          { name: "Mon", value: Math.floor(avgPerDay * 0.8) },
          { name: "Tue", value: Math.floor(avgPerDay * 1.2) },
          { name: "Wed", value: Math.floor(avgPerDay * 0.9) },
          { name: "Thu", value: Math.floor(avgPerDay * 1.4) },
          { name: "Fri", value: Math.floor(avgPerDay * 1.1) },
          { name: "Sat", value: Math.floor(avgPerDay * 0.7) },
          { name: "Sun", value: Math.floor(avgPerDay * 0.9) },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
      setWalletStats({ balance: "0", transactions: 0 });
      setActivityData([
        { name: "Mon", value: 0 },
        { name: "Tue", value: 0 },
        { name: "Wed", value: 0 },
        { name: "Thu", value: 0 },
        { name: "Fri", value: 0 },
        { name: "Sat", value: 0 },
        { name: "Sun", value: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadContributions = async () => {
    if (!address) return;

    try {
      // Load social connections from localStorage
      const connectionsData = localStorage.getItem(`social_connections_${address}`);

      if (!connectionsData) {
        setContributions({
          twitter: { connected: false, points: 0 },
          discord: { connected: false, points: 0 },
          telegram: { connected: false, points: 0 },
          github: { connected: false, points: 0 },
          total: 0,
        });
        return;
      }

      const connections = JSON.parse(connectionsData);
      let twitterPoints = 0;
      let discordPoints = 0;
      let telegramPoints = 0;
      let githubPoints = 0;

      // Fetch contribution points from each platform
      if (connections.twitter?.connected && connections.twitter?.username) {
        // In a real implementation, this would call your API
        // For now, using placeholder or fetching from localStorage
        twitterPoints = await fetchTwitterContributions(connections.twitter.username);
      }

      if (connections.discord?.connected && connections.discord?.userId) {
        discordPoints = await fetchDiscordContributions(connections.discord.userId);
      }

      if (connections.telegram?.connected && connections.telegram?.userId) {
        telegramPoints = await fetchTelegramContributions(connections.telegram.userId);
      }

      if (connections.github?.connected && connections.github?.username) {
        githubPoints = await fetchGithubContributions(connections.github.username);
      }

      const total = twitterPoints + discordPoints + telegramPoints + githubPoints;

      setContributions({
        twitter: {
          connected: connections.twitter?.connected || false,
          username: connections.twitter?.username,
          points: twitterPoints,
        },
        discord: {
          connected: connections.discord?.connected || false,
          displayName: connections.discord?.displayName,
          points: discordPoints,
        },
        telegram: {
          connected: connections.telegram?.connected || false,
          displayName: connections.telegram?.displayName,
          points: telegramPoints,
        },
        github: {
          connected: connections.github?.connected || false,
          username: connections.github?.username,
          points: githubPoints,
        },
        total,
      });
    } catch (error) {
      console.error("Failed to load contributions:", error);
    }
  };

  const fetchTwitterContributions = async (username: string): Promise<number> => {
    // TODO: Implement real API call
    // For now, return 0 or cached value
    return 0;
  };

  const fetchDiscordContributions = async (userId: string): Promise<number> => {
    // TODO: Implement real API call
    return 0;
  };

  const fetchTelegramContributions = async (userId: string): Promise<number> => {
    // TODO: Implement real API call
    return 0;
  };

  const fetchGithubContributions = async (username: string): Promise<number> => {
    try {
      // Fetch real GitHub data
      const response = await fetch(`https://api.github.com/users/${username}/events/public`);
      if (!response.ok) return 0;

      const events = await response.json();
      if (!Array.isArray(events)) return 0;

      let points = 0;
      events.forEach((event: any) => {
        if (event.type === "PushEvent") points += (event.payload?.commits?.length || 0) * 10;
        if (event.type === "PullRequestEvent") points += 50;
        if (event.type === "IssuesEvent") points += 20;
        if (event.type === "IssueCommentEvent") points += 5;
      });

      return points;
    } catch (error) {
      console.error("Failed to fetch GitHub contributions:", error);
      return 0;
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Wallet size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect your Demos Wallet to view dashboard</p>
      </div>
    );
  }

  const hasConnectedAccounts =
    contributions.twitter.connected ||
    contributions.discord.connected ||
    contributions.telegram.connected ||
    contributions.github.connected;

  return (
    <div className="space-y-12">
      {/* SECTION 1: Wallet Stats */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Wallet Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Balance</p>
                <p className="text-3xl font-bold">{loading ? "..." : walletStats.balance} DEM</p>
              </div>
              <Wallet className="text-gray-600" size={40} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Transactions</p>
                <p className="text-3xl font-bold">{loading ? "..." : walletStats.transactions}</p>
              </div>
              <TrendingUp className="text-gray-600" size={40} />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity size={24} />
            Activity Chart
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: "8px" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#ffffff"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
          {walletStats.transactions === 0 && (
            <p className="text-center text-gray-500 text-sm mt-4">
              No transactions yet. Start using your wallet to see activity!
            </p>
          )}
        </div>
      </div>

      {/* SECTION 2: Contributions */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Contributions</h2>

        {!hasConnectedAccounts ? (
          <div className="card text-center py-12">
            <Trophy size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Connected Accounts</h3>
            <p className="text-gray-400">Connect your accounts in Settings to track contributions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Twitter */}
            {contributions.twitter.connected && (
              <div className="card">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-500/10 p-4 rounded-full mb-3">
                    <Twitter size={32} className="text-blue-400" />
                  </div>
                  <h3 className="font-bold mb-1">X (Twitter)</h3>
                  <p className="text-sm text-gray-400 mb-3">@{contributions.twitter.username}</p>
                  <p className="text-3xl font-bold">{contributions.twitter.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">points</p>
                </div>
              </div>
            )}

            {/* Discord */}
            {contributions.discord.connected && (
              <div className="card">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-indigo-500/10 p-4 rounded-full mb-3">
                    <MessageCircle size={32} className="text-indigo-400" />
                  </div>
                  <h3 className="font-bold mb-1">Discord</h3>
                  <p className="text-sm text-gray-400 mb-3">{contributions.discord.displayName}</p>
                  <p className="text-3xl font-bold">{contributions.discord.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">points</p>
                </div>
              </div>
            )}

            {/* Telegram */}
            {contributions.telegram.connected && (
              <div className="card">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-400/10 p-4 rounded-full mb-3">
                    <TelegramIcon size={32} className="text-blue-300" />
                  </div>
                  <h3 className="font-bold mb-1">Telegram</h3>
                  <p className="text-sm text-gray-400 mb-3">{contributions.telegram.displayName}</p>
                  <p className="text-3xl font-bold">{contributions.telegram.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">points</p>
                </div>
              </div>
            )}

            {/* GitHub */}
            {contributions.github.connected && (
              <div className="card">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-gray-500/10 p-4 rounded-full mb-3">
                    <Github size={32} className="text-gray-300" />
                  </div>
                  <h3 className="font-bold mb-1">GitHub</h3>
                  <p className="text-sm text-gray-400 mb-3">@{contributions.github.username}</p>
                  <p className="text-3xl font-bold">{contributions.github.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">points</p>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="card bg-gradient-to-br from-white/5 to-white/10 border-2 border-white/20">
              <div className="flex flex-col items-center text-center">
                <div className="bg-yellow-500/10 p-4 rounded-full mb-3">
                  <Trophy size={32} className="text-yellow-400" />
                </div>
                <h3 className="font-bold mb-1">Total</h3>
                <p className="text-sm text-gray-400 mb-3">All Platforms</p>
                <p className="text-4xl font-bold">{contributions.total.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">total points</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
