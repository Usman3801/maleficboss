"use client";
import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";

const PERP_TOKENS = [
  { symbol: "BTC", name: "Bitcoin", price: "42000" },
  { symbol: "ETH", name: "Ethereum", price: "2200" },
  { symbol: "BNB", name: "BNB", price: "310" },
  { symbol: "SOL", name: "Solana", price: "95" },
  { symbol: "ADA", name: "Cardano", price: "0.52" },
  { symbol: "DOT", name: "Polkadot", price: "7.20" },
  { symbol: "MATIC", name: "Polygon", price: "0.85" },
  { symbol: "AVAX", name: "Avalanche", price: "38" },
  { symbol: "LINK", name: "Chainlink", price: "15" },
  { symbol: "UNI", name: "Uniswap", price: "6.50" },
];

export default function Perpetuals() {
  const { isConnected } = useWallet();
  const [selectedToken, setSelectedToken] = useState(PERP_TOKENS[0]);
  const [position, setPosition] = useState<"long" | "short">("long");
  const [leverage, setLeverage] = useState(1);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrade = async () => {
    if (!isConnected || !amount) return;
    setLoading(true);
    try {
      console.log("Opening position:", { selectedToken, position, leverage, amount });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(`${position.toUpperCase()} position opened for ${selectedToken.symbol}!`);
      setAmount("");
    } catch (error) {
      console.error(error);
      alert("Failed to open position");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <TrendingUp size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect wallet to trade perpetuals</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Perpetual Futures Trading</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-xl font-bold mb-6">Open Position</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Select Asset</label>
              <select className="input-field" value={selectedToken.symbol} onChange={(e) => setSelectedToken(PERP_TOKENS.find((t) => t.symbol === e.target.value)!)}>
                {PERP_TOKENS.map((token) => (
                  <option key={token.symbol} value={token.symbol}>{token.symbol} - ${token.price}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setPosition("long")} className={`p-4 rounded-lg border-2 transition-colors ${position === "long" ? "border-green-500 bg-green-500/10" : "border-border hover:border-green-500/50"}`}>
                <TrendingUp className="mx-auto mb-2" size={24} />
                <div className="font-bold">LONG</div>
              </button>
              <button onClick={() => setPosition("short")} className={`p-4 rounded-lg border-2 transition-colors ${position === "short" ? "border-red-500 bg-red-500/10" : "border-border hover:border-red-500/50"}`}>
                <TrendingDown className="mx-auto mb-2" size={24} />
                <div className="font-bold">SHORT</div>
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Leverage: {leverage}x</label>
              <input type="range" min="1" max="10" value={leverage} onChange={(e) => setLeverage(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1x</span><span>10x</span></div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount (DEMOS)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className="input-field" />
            </div>
            <button onClick={handleTrade} disabled={loading || !amount} className="btn-primary w-full flex items-center justify-center space-x-2">
              {loading ? (<><Loader2 className="animate-spin" size={20} /><span>Opening...</span></>) : (<span>Open {position.toUpperCase()}</span>)}
            </button>
          </div>
        </div>
        <div className="card">
          <h3 className="text-xl font-bold mb-6">Market Info</h3>
          <div className="space-y-4">
            <div><div className="text-sm text-gray-400">Asset</div><div className="text-lg font-bold">{selectedToken.name}</div></div>
            <div><div className="text-sm text-gray-400">Price</div><div className="text-lg font-bold">${selectedToken.price}</div></div>
            <div><div className="text-sm text-gray-400">24h Change</div><div className="text-lg font-bold text-green-500">+5.23%</div></div>
            <div><div className="text-sm text-gray-400">24h Volume</div><div className="text-lg font-bold">$2.5B</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
