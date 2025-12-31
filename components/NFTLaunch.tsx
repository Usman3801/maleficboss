"use client";
import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Image as ImageIcon, Loader2, Upload } from "lucide-react";

export default function NFTLaunch() {
  const { isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    collectionName: "",
    symbol: "",
    baseURI: "",
    maxSupply: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    setLoading(true);
    try {
      console.log("Launching NFT:", formData);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("NFT collection created successfully!");
      setFormData({ collectionName: "", symbol: "", baseURI: "", maxSupply: "" });
    } catch (error) {
      console.error(error);
      alert("Failed to create NFT collection");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ImageIcon size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect wallet to launch NFT collections</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Launch NFT Collection</h2>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Collection Name</label>
            <input type="text" value={formData.collectionName} onChange={(e) => setFormData({ ...formData, collectionName: e.target.value })} placeholder="e.g., My NFT Collection" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Symbol</label>
            <input type="text" value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })} placeholder="e.g., MNFT" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Base URI</label>
            <input type="text" value={formData.baseURI} onChange={(e) => setFormData({ ...formData, baseURI: e.target.value })} placeholder="ipfs:// or https://" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Supply</label>
            <input type="number" value={formData.maxSupply} onChange={(e) => setFormData({ ...formData, maxSupply: e.target.value })} placeholder="e.g., 10000" className="input-field" required />
          </div>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-sm text-gray-400 mb-2">Upload Collection Image</p>
            <input type="file" className="hidden" id="nft-upload" accept="image/*" />
            <label htmlFor="nft-upload" className="btn-secondary cursor-pointer inline-block">Choose File</label>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center space-x-2">
            {loading ? (<><Loader2 className="animate-spin" size={20} /><span>Launching...</span></>) : (<><ImageIcon size={20} /><span>Launch Collection</span></>)}
          </button>
        </form>
      </div>
    </div>
  );
}
