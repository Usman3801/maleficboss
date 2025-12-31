"use client";
import { useState, useEffect } from "react";
import { Rocket, Image, Coins, TrendingUp, ExternalLink, Wallet } from "lucide-react";
import { useWalletConnection } from "@/hooks/useWalletConnection";

interface PumpFunToken {
  mint: string;
  name: string;
  symbol: string;
  marketCap: number;
  price: number;
  volume24h: number;
}

interface MagicEdenNFT {
  symbol: string;
  name: string;
  floorPrice: number;
  listedCount: number;
  volumeAll: number;
}

export default function Launchpad() {
  const { isConnected } = useWalletConnection();
  const [activeTab, setActiveTab] = useState<"token" | "nft">("token");
  const [pumpTokens, setPumpTokens] = useState<PumpFunToken[]>([]);
  const [magicNFTs, setMagicNFTs] = useState<MagicEdenNFT[]>([]);
  const [loading, setLoading] = useState(true);

  // Token launch form
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");

  // NFT launch form
  const [nftName, setNftName] = useState("");
  const [nftSymbol, setNftSymbol] = useState("");
  const [nftSupply, setNftSupply] = useState("");
  const [nftRoyalty, setNftRoyalty] = useState("");

  useEffect(() => {
    fetchLaunchpadData();
  }, []);

  const fetchLaunchpadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchPumpFunTokens(), fetchMagicEdenCollections()]);
    } catch (error) {
      console.error("Failed to fetch launchpad data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPumpFunTokens = async () => {
    try {
      // Pump.fun API endpoint (hypothetical - adjust based on actual API)
      const response = await fetch("https://frontend-api.pump.fun/coins?limit=10&sort=last_trade_timestamp&order=DESC");

      if (!response.ok) throw new Error("Failed to fetch Pump.fun tokens");

      const data = await response.json();

      if (Array.isArray(data)) {
        const tokens: PumpFunToken[] = data.slice(0, 10).map((token: any) => ({
          mint: token.mint || "",
          name: token.name || "Unknown",
          symbol: token.symbol || "N/A",
          marketCap: token.usd_market_cap || 0,
          price: token.price_usd || 0,
          volume24h: token.volume_24h || 0,
        }));
        setPumpTokens(tokens);
      } else {
        setPumpTokens([]);
      }
    } catch (error) {
      console.error("Failed to fetch Pump.fun tokens:", error);
      setPumpTokens([]);
    }
  };

  const fetchMagicEdenCollections = async () => {
    try {
      // Magic Eden API (using popular collections endpoint)
      const response = await fetch("https://api-mainnet.magiceden.dev/v2/collections?offset=0&limit=10");

      if (!response.ok) throw new Error("Failed to fetch Magic Eden collections");

      const data = await response.json();

      if (Array.isArray(data)) {
        const nfts: MagicEdenNFT[] = data.map((collection: any) => ({
          symbol: collection.symbol || "",
          name: collection.name || "Unknown Collection",
          floorPrice: collection.floorPrice ? collection.floorPrice / 1e9 : 0, // Convert from lamports
          listedCount: collection.listedCount || 0,
          volumeAll: collection.volumeAll ? collection.volumeAll / 1e9 : 0,
        }));
        setMagicNFTs(nfts);
      } else {
        setMagicNFTs([]);
      }
    } catch (error) {
      console.error("Failed to fetch Magic Eden collections:", error);
      setMagicNFTs([]);
    }
  };

  const handleTokenLaunch = () => {
    if (!tokenName || !tokenSymbol || !tokenSupply) {
      alert("Please fill in all required fields");
      return;
    }

    // This would integrate with Pump.fun API
    alert(`Token Launch Feature: This would launch ${tokenName} ($${tokenSymbol}) on Pump.fun with supply of ${tokenSupply}. Integration with Pump.fun API required.`);
  };

  const handleNFTLaunch = () => {
    if (!nftName || !nftSymbol || !nftSupply) {
      alert("Please fill in all required fields");
      return;
    }

    // This would integrate with Magic Eden launchpad API
    alert(`NFT Launch Feature: This would launch ${nftName} collection on Magic Eden with ${nftSupply} items. Integration with Magic Eden Launchpad API required.`);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Wallet size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect wallet to access launchpad</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Launchpad</h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("token")}
          className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === "token"
              ? "border-b-2 border-white text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Coins size={20} />
          Token Launch
        </button>
        <button
          onClick={() => setActiveTab("nft")}
          className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === "nft"
              ? "border-b-2 border-white text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Image size={20} />
          NFT Launch
        </button>
      </div>

      {/* Token Launch Tab */}
      {activeTab === "token" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Launch Form */}
          <div className="card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Rocket size={24} />
              Launch Your Token
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Token Name *</label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="My Awesome Token"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Token Symbol *</label>
                <input
                  type="text"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                  placeholder="MAT"
                  maxLength={10}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Supply *</label>
                <input
                  type="number"
                  value={tokenSupply}
                  onChange={(e) => setTokenSupply(e.target.value)}
                  placeholder="1000000"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={tokenDescription}
                  onChange={(e) => setTokenDescription(e.target.value)}
                  placeholder="Describe your token..."
                  rows={4}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-white focus:outline-none resize-none"
                />
              </div>
              <button onClick={handleTokenLaunch} className="w-full btn-primary py-4 font-semibold text-lg">
                Launch on Pump.fun
              </button>
              <p className="text-xs text-gray-500 text-center">
                Launch cost: 0.02 DEM (~$0.02 USD)
              </p>
            </div>
          </div>

          {/* Recent Launches */}
          <div className="card">
            <h3 className="text-xl font-bold mb-6">Recent Token Launches</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                <p className="mt-2 text-sm text-gray-400">Loading tokens...</p>
              </div>
            ) : pumpTokens.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No tokens found</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {pumpTokens.map((token) => (
                  <div key={token.mint} className="bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-bold">${token.symbol}</h4>
                        <p className="text-sm text-gray-400">{token.name}</p>
                      </div>
                      <a
                        href={`https://pump.fun/${token.mint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Market Cap:</span>
                        <p className="font-semibold">${(token.marketCap / 1000).toFixed(1)}K</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <p className="font-semibold">${token.price.toFixed(6)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* NFT Launch Tab */}
      {activeTab === "nft" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Launch Form */}
          <div className="card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Rocket size={24} />
              Launch Your NFT Collection
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Collection Name *</label>
                <input
                  type="text"
                  value={nftName}
                  onChange={(e) => setNftName(e.target.value)}
                  placeholder="My NFT Collection"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Collection Symbol *</label>
                <input
                  type="text"
                  value={nftSymbol}
                  onChange={(e) => setNftSymbol(e.target.value.toUpperCase())}
                  placeholder="MNFT"
                  maxLength={10}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Supply *</label>
                <input
                  type="number"
                  value={nftSupply}
                  onChange={(e) => setNftSupply(e.target.value)}
                  placeholder="10000"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Royalty % *</label>
                <input
                  type="number"
                  value={nftRoyalty}
                  onChange={(e) => setNftRoyalty(e.target.value)}
                  placeholder="5"
                  min="0"
                  max="50"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-white focus:outline-none"
                />
              </div>
              <button onClick={handleNFTLaunch} className="w-full btn-primary py-4 font-semibold text-lg">
                Launch on Magic Eden
              </button>
              <p className="text-xs text-gray-500 text-center">
                Launch cost: 0.1 DEM (~$0.10 USD)
              </p>
            </div>
          </div>

          {/* Popular Collections */}
          <div className="card">
            <h3 className="text-xl font-bold mb-6">Popular Collections</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                <p className="mt-2 text-sm text-gray-400">Loading collections...</p>
              </div>
            ) : magicNFTs.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No collections found</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {magicNFTs.map((nft) => (
                  <div key={nft.symbol} className="bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-bold">{nft.name}</h4>
                        <p className="text-sm text-gray-400">{nft.symbol}</p>
                      </div>
                      <a
                        href={`https://magiceden.io/marketplace/${nft.symbol}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Floor:</span>
                        <p className="font-semibold">{nft.floorPrice.toFixed(2)} SOL</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Listed:</span>
                        <p className="font-semibold">{nft.listedCount}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Volume:</span>
                        <p className="font-semibold">{(nft.volumeAll / 1000).toFixed(1)}K</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="card bg-yellow-500/10 border border-yellow-500/50">
        <p className="text-sm text-gray-300">
          💡 <strong>Note:</strong> Token launches are powered by Pump.fun and NFT launches use Magic Eden's launchpad.
          All fees are paid in DEM tokens. Make sure you have sufficient DEM balance before launching.
        </p>
      </div>
    </div>
  );
}
