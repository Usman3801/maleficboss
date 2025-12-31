"use client";
import { useWallet } from "@/contexts/WalletContext";
import { Wallet, TrendingUp, Activity, Users } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "Mon", value: 400 },
  { name: "Tue", value: 300 },
  { name: "Wed", value: 600 },
  { name: "Thu", value: 800 },
  { name: "Fri", value: 700 },
  { name: "Sat", value: 900 },
  { name: "Sun", value: 1100 },
];

export default function Dashboard() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Wallet size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect your Demos Wallet to view dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Balance</p>
              <p className="text-2xl font-bold">0 DEMOS</p>
            </div>
            <Wallet className="text-gray-600" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">24h Volume</p>
              <p className="text-2xl font-bold">$12,345</p>
            </div>
            <TrendingUp className="text-gray-600" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Transactions</p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <Activity className="text-gray-600" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Community Score</p>
              <p className="text-2xl font-bold">2,847</p>
            </div>
            <Users className="text-gray-600" size={32} />
          </div>
        </div>
      </div>
      <div className="card">
        <h3 className="text-xl font-bold mb-6">Portfolio Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: "8px" }} />
            <Area type="monotone" dataKey="value" stroke="#ffffff" fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
