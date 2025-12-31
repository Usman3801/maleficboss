"use client";
import { useState, useEffect } from "react";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { Send, Wallet, Loader2 } from "lucide-react";
import { JsonRpcProvider } from "ethers";

export default function TokenTransfer() {
  const { isConnected, address } = useWalletConnection();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState("0");
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [formData, setFormData] = useState({
    recipient: "",
    amount: "",
  });

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance();
    }
  }, [isConnected, address]);

  const fetchBalance = async () => {
    if (!address) return;

    setLoadingBalance(true);
    try {
      const provider = new JsonRpcProvider("https://testnet-rpc.demos.network");
      const bal = await provider.getBalance(address);
      const balanceInDEM = (Number(bal) / 1e18).toFixed(4);
      setBalance(balanceInDEM);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      setBalance("0");
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) return;

    const amount = parseFloat(formData.amount);
    const currentBalance = parseFloat(balance);

    if (amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    if (amount > currentBalance) {
      alert(`Insufficient balance. You have ${balance} DEM`);
      return;
    }

    setLoading(true);
    try {
      // This would use the actual wallet's private key to sign and send transaction
      console.log("Transferring:", formData);
      alert(`Transfer functionality requires wallet signing integration. Would send ${formData.amount} DEM to ${formData.recipient}`);
      setFormData({ recipient: "", amount: "" });
    } catch (error) {
      console.error(error);
      alert("Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Wallet size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect wallet to transfer tokens</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Transfer DEM Tokens</h2>

      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Available Balance</p>
            <p className="text-3xl font-bold">
              {loadingBalance ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={24} className="animate-spin" />
                  Loading...
                </span>
              ) : (
                `${balance} DEM`
              )}
            </p>
          </div>
          <Wallet size={48} className="text-gray-600" />
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Recipient Address *</label>
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              placeholder="0x..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-white focus:outline-none font-mono"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter the Demos Network address</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amount (DEM) *</label>
            <input
              type="number"
              step="0.0001"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.0"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-white focus:outline-none"
              required
            />
            <div className="flex justify-between mt-2">
              <p className="text-sm text-gray-400">
                Available: {loadingBalance ? "..." : `${balance} DEM`}
              </p>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: balance })}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Max
              </button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Network Fee</span>
              <span>~0.0001 DEM</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">You will send</span>
              <span className="font-semibold">{formData.amount || "0"} DEM</span>
            </div>
            <div className="border-t border-gray-700 my-2"></div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Estimated Time</span>
              <span>~15 seconds</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || loadingBalance || parseFloat(balance) === 0}
            className="w-full btn-primary py-4 font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={20} />
                Send DEM
              </>
            )}
          </button>

          {parseFloat(balance) === 0 && !loadingBalance && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                💡 Your wallet has 0 DEM. Visit the Faucet to get free testnet DEM tokens.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
