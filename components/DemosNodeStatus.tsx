"use client";

import { useState, useEffect } from "react";
import { useDemosNode } from "@/hooks/useDemosNode";
import { Activity, Server, Zap, Clock } from "lucide-react";

export default function DemosNodeStatus() {
  const { connector, isConnected, balance, refreshBalance } = useDemosNode("testnet");
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [gasPrice, setGasPrice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch network stats
  const fetchStats = async () => {
    if (!connector) return;

    try {
      const [block, gas] = await Promise.all([
        connector.getBlockNumber(),
        connector.getGasPrice(),
      ]);

      setBlockNumber(block);
      setGasPrice(gas);
    } catch (error) {
      console.error("Failed to fetch network stats:", error);
    }
  };

  // Auto-refresh stats every 10 seconds
  useEffect(() => {
    if (connector) {
      fetchStats();
      const interval = setInterval(fetchStats, 10000);
      return () => clearInterval(interval);
    }
  }, [connector]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshBalance(),
        fetchStats(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!connector) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 text-yellow-500 mb-2">
          <Server size={20} />
          <span className="font-semibold">Connecting to Demos Node...</span>
        </div>
        <p className="text-sm text-gray-400">Initializing connection</p>
      </div>
    );
  }

  const networkInfo = connector.getNetworkInfo();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h3 className="font-bold">Demos Node</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          title="Refresh"
        >
          <Activity size={18} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="space-y-3">
        {/* Network Info */}
        <div className="bg-secondary border border-border rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Network</div>
          <div className="font-semibold capitalize">{networkInfo.network}</div>
          <div className="text-xs text-gray-400 mt-1 font-mono">
            Chain ID: {networkInfo.chainId}
          </div>
        </div>

        {/* Block Number */}
        {blockNumber !== null && (
          <div className="bg-secondary border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-blue-500" />
              <div className="text-xs text-gray-400">Latest Block</div>
            </div>
            <div className="font-semibold font-mono">#{blockNumber.toLocaleString()}</div>
          </div>
        )}

        {/* Gas Price */}
        {gasPrice !== null && (
          <div className="bg-secondary border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-yellow-500" />
              <div className="text-xs text-gray-400">Gas Price</div>
            </div>
            <div className="font-semibold font-mono">
              {(parseInt(gasPrice) / 1e9).toFixed(2)} Gwei
            </div>
          </div>
        )}

        {/* Balance (if connected) */}
        {isConnected && (
          <div className="bg-secondary border border-border rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Your Balance</div>
            <div className="font-semibold">{balance} DEMOS</div>
          </div>
        )}

        {/* RPC Endpoint */}
        <div className="text-xs text-gray-400 border-t border-border pt-3">
          <div className="mb-1">RPC Endpoint:</div>
          <div className="font-mono text-gray-500 break-all">{networkInfo.rpcUrl}</div>
        </div>
      </div>
    </div>
  );
}
