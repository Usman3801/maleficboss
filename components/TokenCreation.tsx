"use client";
import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Coins, Loader2 } from "lucide-react";

export default function TokenCreation() {
  const { isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    totalSupply: "",
    decimals: "18",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    setLoading(true);
    try {
      console.log("Creating token:", formData);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("Token created successfully!");
      setFormData({ name: "", symbol: "", totalSupply: "", decimals: "18" });
    } catch (error) {
      console.error(error);
      alert("Failed to create token");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Coins size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect wallet to create tokens</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Create Custom Token</h2>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Token Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., My Token"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Token Symbol</label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              placeholder="e.g., MTK"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Total Supply</label>
            <input
              type="number"
              value={formData.totalSupply}
              onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
              placeholder="e.g., 1000000"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Decimals</label>
            <input
              type="number"
              value={formData.decimals}
              onChange={(e) => setFormData({ ...formData, decimals: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="bg-accent border border-border rounded-lg p-4">
            <p className="text-sm text-gray-300">
              <strong>Note:</strong> Gas fees paid in DEMOS tokens
            </p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center space-x-2">
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Coins size={20} />
                <span>Create Token</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
