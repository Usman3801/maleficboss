"use client";
import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Send, Loader2, Clock } from "lucide-react";

export default function TokenTransfer() {
  const { isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient: "",
    amount: "",
    token: "DEMOS",
  });

  const [recentTransfers] = useState([
    { to: "0x1234...5678", amount: "100 DEMOS", time: "2 mins ago", status: "Confirmed" },
    { to: "0xabcd...efgh", amount: "50 DEMOS", time: "1 hour ago", status: "Confirmed" },
    { to: "0x9876...5432", amount: "25 DEMOS", time: "3 hours ago", status: "Confirmed" },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    setLoading(true);
    try {
      console.log("Transferring:", formData);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(`Sent ${formData.amount} ${formData.token} to ${formData.recipient}!`);
      setFormData({ recipient: "", amount: "", token: "DEMOS" });
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
        <Send size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect wallet to transfer tokens</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Transfer Tokens</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Address</label>
              <input type="text" value={formData.recipient} onChange={(e) => setFormData({ ...formData, recipient: e.target.value })} placeholder="0x..." className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Token</label>
              <select className="input-field" value={formData.token} onChange={(e) => setFormData({ ...formData, token: e.target.value })}>
                <option value="DEMOS">DEMOS</option>
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.0" className="input-field" required />
              <p className="text-sm text-gray-400 mt-1">Available: 1000 {formData.token}</p>
            </div>
            <div className="bg-accent border border-border rounded-lg p-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Network Fee</span>
                <span>~0.001 DEMOS</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated Time</span>
                <span>~15 seconds</span>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center space-x-2">
              {loading ? (<><Loader2 className="animate-spin" size={20} /><span>Sending...</span></>) : (<><Send size={20} /><span>Send Tokens</span></>)}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-6">Recent Transfers</h3>
          <div className="space-y-4">
            {recentTransfers.map((tx, idx) => (
              <div key={idx} className="bg-accent border border-border rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-mono">{tx.to}</span>
                  <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">{tx.status}</span>
                </div>
                <div className="text-sm font-bold mb-1">{tx.amount}</div>
                <div className="flex items-center text-xs text-gray-400">
                  <Clock size={12} className="mr-1" />
                  {tx.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
