"use client";
import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { ArrowRightLeft, Loader2, Settings } from "lucide-react";

const TOKENS = [
  { symbol: "DEMOS", name: "Demos Token", balance: "1000" },
  { symbol: "ETH", name: "Ethereum", balance: "0.5" },
  { symbol: "USDT", name: "Tether", balance: "500" },
  { symbol: "USDC", name: "USD Coin", balance: "300" },
];

export default function SpotSwap() {
  const { isConnected } = useWallet();
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleSwap = async () => {
    if (!isConnected || !fromAmount) return;
    setLoading(true);
    try {
      console.log("Swapping:", { fromToken, toToken, fromAmount, toAmount, slippage });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(`Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}!`);
      setFromAmount("");
      setToAmount("");
    } catch (error) {
      console.error(error);
      alert("Swap failed");
    } finally {
      setLoading(false);
    }
  };

  const calculateToAmount = (amount: string) => {
    if (!amount) return "";
    const rate = 0.0005;
    return (parseFloat(amount) * rate).toFixed(6);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(calculateToAmount(value));
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ArrowRightLeft size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect wallet to swap tokens</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Spot Swap</h2>
        <button onClick={() => setShowSettings(!showSettings)} className="btn-secondary p-3">
          <Settings size={20} />
        </button>
      </div>

      {showSettings && (
        <div className="card mb-6">
          <h3 className="font-bold mb-4">Settings</h3>
          <div>
            <label className="block text-sm font-medium mb-2">Slippage Tolerance (%)</label>
            <div className="flex gap-2">
              {["0.1", "0.5", "1.0"].map((val) => (
                <button key={val} onClick={() => setSlippage(val)} className={`px-4 py-2 rounded-lg border ${slippage === val ? "border-white bg-white text-black" : "border-border"}`}>
                  {val}%
                </button>
              ))}
              <input type="number" value={slippage} onChange={(e) => setSlippage(e.target.value)} className="input-field w-20" placeholder="Custom" />
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="space-y-4">
          <div className="bg-accent border border-border rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-400">From</label>
              <span className="text-sm text-gray-400">Balance: {fromToken.balance}</span>
            </div>
            <div className="flex gap-4">
              <input type="number" value={fromAmount} onChange={(e) => handleFromAmountChange(e.target.value)} placeholder="0.0" className="bg-transparent text-2xl font-bold outline-none flex-1" />
              <select className="bg-secondary border border-border rounded-lg px-4 py-2" value={fromToken.symbol} onChange={(e) => setFromToken(TOKENS.find((t) => t.symbol === e.target.value)!)}>
                {TOKENS.map((token) => (
                  <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center">
            <button onClick={switchTokens} className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
              <ArrowRightLeft size={20} />
            </button>
          </div>

          <div className="bg-accent border border-border rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-400">To</label>
              <span className="text-sm text-gray-400">Balance: {toToken.balance}</span>
            </div>
            <div className="flex gap-4">
              <input type="number" value={toAmount} readOnly placeholder="0.0" className="bg-transparent text-2xl font-bold outline-none flex-1" />
              <select className="bg-secondary border border-border rounded-lg px-4 py-2" value={toToken.symbol} onChange={(e) => setToToken(TOKENS.find((t) => t.symbol === e.target.value)!)}>
                {TOKENS.map((token) => (
                  <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          {fromAmount && toAmount && (
            <div className="bg-secondary border border-border rounded-lg p-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Rate</span>
                <span>1 {fromToken.symbol} = 0.0005 {toToken.symbol}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Price Impact</span>
                <span className="text-green-500">&lt;0.01%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Network Fee</span>
                <span>~0.001 DEMOS</span>
              </div>
            </div>
          )}

          <button onClick={handleSwap} disabled={loading || !fromAmount} className="btn-primary w-full flex items-center justify-center space-x-2">
            {loading ? (<><Loader2 className="animate-spin" size={20} /><span>Swapping...</span></>) : (<><ArrowRightLeft size={20} /><span>Swap</span></>)}
          </button>
        </div>
      </div>
    </div>
  );
}
