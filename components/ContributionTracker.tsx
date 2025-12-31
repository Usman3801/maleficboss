"use client";
import { useState, useEffect } from "react";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { Github, MessageCircle, Twitter, Send as TelegramIcon, Rocket, Loader2, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface SocialStats {
  github: {
    total: number;
    commits: number;
    prs: number;
    issues: number;
  };
  discord: {
    total: number;
    messages: number;
    reactions: number;
    activeDays: number;
  };
  twitter: {
    total: number;
    tweets: number;
    retweets: number;
    likes: number;
  };
  telegram: {
    total: number;
    messages: number;
    replies: number;
    activeDays: number;
  };
}

interface WeeklyData {
  name: string;
  github: number;
  discord: number;
  twitter: number;
  telegram: number;
}

export default function ContributionTracker() {
  const { isConnected, address } = useWalletConnection();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SocialStats>({
    github: { total: 0, commits: 0, prs: 0, issues: 0 },
    discord: { total: 0, messages: 0, reactions: 0, activeDays: 0 },
    twitter: { total: 0, tweets: 0, retweets: 0, likes: 0 },
    telegram: { total: 0, messages: 0, replies: 0, activeDays: 0 },
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([
    { name: "Mon", github: 0, discord: 0, twitter: 0, telegram: 0 },
    { name: "Tue", github: 0, discord: 0, twitter: 0, telegram: 0 },
    { name: "Wed", github: 0, discord: 0, twitter: 0, telegram: 0 },
    { name: "Thu", github: 0, discord: 0, twitter: 0, telegram: 0 },
    { name: "Fri", github: 0, discord: 0, twitter: 0, telegram: 0 },
    { name: "Sat", github: 0, discord: 0, twitter: 0, telegram: 0 },
    { name: "Sun", github: 0, discord: 0, twitter: 0, telegram: 0 },
  ]);
  const [hasConnectedAccounts, setHasConnectedAccounts] = useState(false);

  // Fetch GitHub contributions
  const fetchGitHubStats = async (username: string) => {
    try {
      // Using GitHub public API
      const userResponse = await fetch(`https://api.github.com/users/${username}`);
      if (!userResponse.ok) throw new Error("GitHub user not found");

      const userData = await userResponse.json();

      // Fetch recent commits/activity from user's repos
      const eventsResponse = await fetch(`https://api.github.com/users/${username}/events/public`);
      const events = await eventsResponse.json();

      // Count contributions by type
      let commits = 0;
      let prs = 0;
      let issues = 0;

      if (Array.isArray(events)) {
        events.forEach((event: any) => {
          if (event.type === "PushEvent") commits += event.payload?.commits?.length || 0;
          if (event.type === "PullRequestEvent") prs++;
          if (event.type === "IssuesEvent") issues++;
        });
      }

      return {
        total: commits + prs + issues,
        commits,
        prs,
        issues,
      };
    } catch (err) {
      console.error("GitHub API error:", err);
      return { total: 0, commits: 0, prs: 0, issues: 0 };
    }
  };

  // Fetch Twitter stats (Note: Twitter API requires auth, this is a placeholder)
  const fetchTwitterStats = async (username: string) => {
    try {
      // In production, you would call your backend API that has Twitter API credentials
      // For now, return simulated data based on username existence
      const response = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
        headers: {
          // Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` // Backend only
        },
      }).catch(() => null);

      // Placeholder: In real implementation, fetch user timeline and engagement
      return {
        total: 0,
        tweets: 0,
        retweets: 0,
        likes: 0,
      };
    } catch (err) {
      console.error("Twitter API error:", err);
      return { total: 0, tweets: 0, retweets: 0, likes: 0 };
    }
  };

  // Fetch Discord stats (requires bot integration)
  const fetchDiscordStats = async (userId: string) => {
    try {
      // This requires a custom backend with Discord bot integration
      // The bot would track user messages in Demos Network Discord server
      const response = await fetch(`/api/discord/stats/${userId}`).catch(() => null);

      if (response && response.ok) {
        return await response.json();
      }

      return { total: 0, messages: 0, reactions: 0, activeDays: 0 };
    } catch (err) {
      console.error("Discord API error:", err);
      return { total: 0, messages: 0, reactions: 0, activeDays: 0 };
    }
  };

  // Fetch Telegram stats (requires bot integration)
  const fetchTelegramStats = async (userId: string) => {
    try {
      // This requires a custom backend with Telegram bot integration
      // The bot would track user messages in Demos Network Telegram group
      const response = await fetch(`/api/telegram/stats/${userId}`).catch(() => null);

      if (response && response.ok) {
        return await response.json();
      }

      return { total: 0, messages: 0, replies: 0, activeDays: 0 };
    } catch (err) {
      console.error("Telegram API error:", err);
      return { total: 0, messages: 0, replies: 0, activeDays: 0 };
    }
  };

  // Fetch weekly activity data
  const fetchWeeklyActivity = async (connections: any) => {
    // Generate weekly data based on real activity patterns
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyActivity: WeeklyData[] = days.map((name) => ({
      name,
      github: 0,
      discord: 0,
      twitter: 0,
      telegram: 0,
    }));

    // In a real implementation, you would fetch daily breakdowns from each API
    // For now, distribute the total counts across the week randomly
    return weeklyActivity;
  };

  useEffect(() => {
    const loadContributions = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get connected accounts from localStorage (set by Profile component)
        const connectionsData = localStorage.getItem(`social_connections_${address}`);

        if (!connectionsData) {
          setHasConnectedAccounts(false);
          setLoading(false);
          return;
        }

        const connections = JSON.parse(connectionsData);
        let hasAnyConnection = false;

        // Fetch GitHub stats
        if (connections.github?.connected && connections.github?.username) {
          hasAnyConnection = true;
          const githubStats = await fetchGitHubStats(connections.github.username);
          setStats((prev) => ({ ...prev, github: githubStats }));
        }

        // Fetch Twitter stats
        if (connections.twitter?.connected && connections.twitter?.username) {
          hasAnyConnection = true;
          const twitterStats = await fetchTwitterStats(connections.twitter.username);
          setStats((prev) => ({ ...prev, twitter: twitterStats }));
        }

        // Fetch Discord stats
        if (connections.discord?.connected && connections.discord?.userId) {
          hasAnyConnection = true;
          const discordStats = await fetchDiscordStats(connections.discord.userId);
          setStats((prev) => ({ ...prev, discord: discordStats }));
        }

        // Fetch Telegram stats
        if (connections.telegram?.connected && connections.telegram?.userId) {
          hasAnyConnection = true;
          const telegramStats = await fetchTelegramStats(connections.telegram.userId);
          setStats((prev) => ({ ...prev, telegram: telegramStats }));
        }

        setHasConnectedAccounts(hasAnyConnection);

        if (hasAnyConnection) {
          const weekly = await fetchWeeklyActivity(connections);
          setWeeklyData(weekly);
        }
      } catch (err) {
        console.error("Error loading contributions:", err);
        setError("Failed to load contribution data");
      } finally {
        setLoading(false);
      }
    };

    loadContributions();

    // Refresh data every 5 minutes
    const interval = setInterval(loadContributions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Rocket size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect wallet to track your contributions</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={64} className="text-white animate-spin mb-4" />
        <h2 className="text-2xl font-bold mb-2">Loading Contributions...</h2>
        <p className="text-gray-400">Fetching your activity across platforms</p>
      </div>
    );
  }

  if (!hasConnectedAccounts) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Connected Accounts</h2>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          Connect your social accounts in the Profile tab to track your contributions to the Demos Network community
        </p>
        <a href="?tab=profile" className="btn-primary px-6 py-3">
          Go to Profile
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  const totalScore = stats.github.total + stats.discord.total + stats.twitter.total + stats.telegram.total;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Contribution Tracker</h2>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary flex items-center gap-2"
        >
          <Loader2 size={16} />
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Github size={32} />
            <span className="text-2xl font-bold">{stats.github.total}</span>
          </div>
          <h3 className="font-bold mb-1">GitHub</h3>
          <p className="text-sm text-gray-400">Commits: {stats.github.commits}</p>
          <p className="text-sm text-gray-400">PRs: {stats.github.prs}</p>
          <p className="text-sm text-gray-400">Issues: {stats.github.issues}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <MessageCircle size={32} />
            <span className="text-2xl font-bold">{stats.discord.total}</span>
          </div>
          <h3 className="font-bold mb-1">Discord</h3>
          <p className="text-sm text-gray-400">Messages: {stats.discord.messages}</p>
          <p className="text-sm text-gray-400">Reactions: {stats.discord.reactions}</p>
          <p className="text-sm text-gray-400">Active Days: {stats.discord.activeDays}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Twitter size={32} />
            <span className="text-2xl font-bold">{stats.twitter.total}</span>
          </div>
          <h3 className="font-bold mb-1">X (Twitter)</h3>
          <p className="text-sm text-gray-400">Tweets: {stats.twitter.tweets}</p>
          <p className="text-sm text-gray-400">Retweets: {stats.twitter.retweets}</p>
          <p className="text-sm text-gray-400">Likes: {stats.twitter.likes}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <TelegramIcon size={32} />
            <span className="text-2xl font-bold">{stats.telegram.total}</span>
          </div>
          <h3 className="font-bold mb-1">Telegram</h3>
          <p className="text-sm text-gray-400">Messages: {stats.telegram.messages}</p>
          <p className="text-sm text-gray-400">Replies: {stats.telegram.replies}</p>
          <p className="text-sm text-gray-400">Active Days: {stats.telegram.activeDays}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold mb-6">Weekly Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: "8px" }} />
            <Bar dataKey="github" fill="#ffffff" opacity={0.9} />
            <Bar dataKey="discord" fill="#888888" opacity={0.7} />
            <Bar dataKey="twitter" fill="#666666" opacity={0.5} />
            <Bar dataKey="telegram" fill="#444444" opacity={0.3} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white opacity-90"></div><span>GitHub</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-500 opacity-70"></div><span>Discord</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-600 opacity-50"></div><span>Twitter</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-700 opacity-30"></div><span>Telegram</span></div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold mb-6">Total Community Score</h3>
        <div className="text-center">
          <div className="text-6xl font-bold mb-2">{totalScore.toLocaleString()}</div>
          <p className="text-gray-400 mb-4">
            Based on your activity across all connected platforms
          </p>
          <div className="bg-accent rounded-full h-4 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500"
              style={{ width: `${Math.min((totalScore / 100) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Keep contributing to increase your score!
          </p>
        </div>
      </div>

      <div className="card bg-accent border-2 border-white/10">
        <h3 className="text-lg font-bold mb-3">📊 About Your Stats</h3>
        <div className="text-sm text-gray-300 space-y-2">
          <p>• <strong>GitHub:</strong> Real-time data from your public repositories and events</p>
          <p>• <strong>Discord:</strong> Requires backend integration with Demos Discord server</p>
          <p>• <strong>Twitter/X:</strong> Requires Twitter API access (backend only)</p>
          <p>• <strong>Telegram:</strong> Requires bot integration with Demos Telegram group</p>
          <p className="text-gray-400 mt-4">
            💡 Connect your accounts in the Profile tab to see your real contributions!
          </p>
        </div>
      </div>
    </div>
  );
}
