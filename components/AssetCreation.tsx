"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Coins, Image as ImageIcon, Loader2, Upload, ExternalLink, TrendingUp, AlertCircle } from "lucide-react";
import {
  getTrendingCollections,
  uploadToIPFS,
  validateCollectionData,
  formatFloorPrice,
  type LaunchpadCollection,
} from "@/lib/magic-eden-api";
import {
  createToken,
  getTrendingTokens,
  uploadTokenImage,
  validateTokenData,
  calculateBondingCurvePrice,
  formatCurrency,
  formatPriceChange,
  getPriceChangeColor,
  formatNumber,
  calculateGasFee,
  type TokenData,
  type BondingCurveConfig,
} from "@/lib/pumpfun-api";

export default function AssetCreation() {
  const { isConnected, address } = useWallet();
  const [activeType, setActiveType] = useState<"token" | "nft">("token");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Token data (Pump.fun)
  const [tokenData, setTokenData] = useState<TokenData>({
    name: "",
    symbol: "",
    description: "",
    image: null,
    twitter: "",
    telegram: "",
    website: "",
    initialSupply: 1000000000,
    initialPrice: 0.0001,
  });

  const [bondingCurve, setBondingCurve] = useState<BondingCurveConfig>({
    initialPrice: 0.0001,
    targetPrice: 0.01,
    supply: 1000000000,
    curveType: "exponential",
  });

  const [trendingTokens, setTrendingTokens] = useState<any[]>([]);

  // NFT data (Magic Eden)
  const [nftData, setNftData] = useState<LaunchpadCollection>({
    name: "",
    symbol: "",
    description: "",
    image: null,
    supply: 10000,
    price: 0.1,
    royalties: 5,
    website: "",
    twitter: "",
    discord: "",
  });

  const [trendingCollections, setTrendingCollections] = useState<any[]>([]);

  // Fetch trending data on mount
  useEffect(() => {
    const fetchTrending = async () => {
      if (activeType === "token") {
        const tokens = await getTrendingTokens();
        setTrendingTokens(tokens);
      } else {
        const collections = await getTrendingCollections();
        setTrendingCollections(collections.slice(0, 5));
      }
    };

    fetchTrending();
  }, [activeType]);

  // Calculate current bonding curve price
  const currentPrice = calculateBondingCurvePrice(
    tokenData.initialSupply / 2,
    bondingCurve
  );

  const handleTokenImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const imageUrl = await uploadTokenImage(file);
      setTokenData({ ...tokenData, image: file });
      console.log("Image uploaded:", imageUrl);
    } catch (error: any) {
      alert(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNFTImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const ipfsUrl = await uploadToIPFS(file);
      setNftData({ ...nftData, image: file });
      console.log("Image uploaded to IPFS:", ipfsUrl);
    } catch (error: any) {
      alert(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTokenCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;

    // Validate
    const validation = validateTokenData(tokenData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const txHash = await createToken(tokenData);
      setTxHash(txHash);
      alert(
        `Token created successfully!\n\nTransaction: ${txHash}\n\nView on Explorer: https://explorer.demos.sh/tx/${txHash}`
      );
      // Reset form
      setTokenData({
        name: "",
        symbol: "",
        description: "",
        image: null,
        twitter: "",
        telegram: "",
        website: "",
        initialSupply: 1000000000,
        initialPrice: 0.0001,
      });
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to create token");
    } finally {
      setLoading(false);
    }
  };

  const handleNFTCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;

    // Validate
    const validation = validateCollectionData(nftData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      // Simulate NFT collection creation
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64);
      setTxHash(mockTxHash);
      alert(
        `NFT collection created successfully!\n\nTransaction: ${mockTxHash}\n\nView on Explorer: https://explorer.demos.sh/tx/${mockTxHash}`
      );
      // Reset form
      setNftData({
        name: "",
        symbol: "",
        description: "",
        image: null,
        supply: 10000,
        price: 0.1,
        royalties: 5,
        website: "",
        twitter: "",
        discord: "",
      });
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to create NFT collection");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Coins size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect wallet to create digital assets</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Create Digital Assets</h2>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveType("token")}
          className={`flex-1 p-6 rounded-lg border-2 transition-colors ${
            activeType === "token"
              ? "border-white bg-white/10"
              : "border-border hover:border-white/50"
          }`}
        >
          <Coins className="mx-auto mb-3" size={32} />
          <h3 className="font-bold text-lg">Token</h3>
          <p className="text-sm text-gray-400 mt-2">Launch meme coins with bonding curves</p>
        </button>

        <button
          onClick={() => setActiveType("nft")}
          className={`flex-1 p-6 rounded-lg border-2 transition-colors ${
            activeType === "nft"
              ? "border-white bg-white/10"
              : "border-border hover:border-white/50"
          }`}
        >
          <ImageIcon className="mx-auto mb-3" size={32} />
          <h3 className="font-bold text-lg">NFT</h3>
          <p className="text-sm text-gray-400 mt-2">Create NFT collections</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          {activeType === "token" ? (
            <div className="card">
              <h3 className="text-xl font-bold mb-6">Launch Token</h3>

              {errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-500">Validation Errors:</p>
                      <ul className="text-sm text-red-400 mt-2 list-disc list-inside">
                        {errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleTokenCreation} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Token Name *</label>
                    <input
                      type="text"
                      value={tokenData.name}
                      onChange={(e) => setTokenData({ ...tokenData, name: e.target.value })}
                      placeholder="e.g., Pepe Coin"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Symbol *</label>
                    <input
                      type="text"
                      value={tokenData.symbol}
                      onChange={(e) =>
                        setTokenData({ ...tokenData, symbol: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g., PEPE"
                      className="input-field"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={tokenData.description}
                    onChange={(e) => setTokenData({ ...tokenData, description: e.target.value })}
                    placeholder="Describe your token..."
                    className="input-field min-h-[100px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Initial Supply *</label>
                    <input
                      type="number"
                      value={tokenData.initialSupply}
                      onChange={(e) =>
                        setTokenData({ ...tokenData, initialSupply: parseFloat(e.target.value) })
                      }
                      placeholder="1000000000"
                      className="input-field"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formatNumber(tokenData.initialSupply)} tokens
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Initial Price (USD) *</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={tokenData.initialPrice}
                      onChange={(e) =>
                        setTokenData({ ...tokenData, initialPrice: parseFloat(e.target.value) })
                      }
                      placeholder="0.0001"
                      className="input-field"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Market Cap: {formatCurrency(tokenData.initialPrice * tokenData.initialSupply)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Token Image *</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {tokenData.image ? (
                      <div className="space-y-2">
                        <p className="text-sm text-green-500">✓ Image uploaded: {tokenData.image.name}</p>
                        <label
                          htmlFor="token-upload"
                          className="btn-secondary cursor-pointer inline-block"
                        >
                          Change Image
                        </label>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className="mx-auto mb-2 text-gray-600" />
                        <p className="text-sm text-gray-400 mb-2">
                          {uploadingImage ? "Uploading..." : "Upload token image (PNG, JPG, GIF)"}
                        </p>
                        <label
                          htmlFor="token-upload"
                          className="btn-secondary cursor-pointer inline-block"
                        >
                          {uploadingImage ? <Loader2 className="animate-spin" size={16} /> : "Choose File"}
                        </label>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      id="token-upload"
                      accept="image/*"
                      onChange={handleTokenImageUpload}
                      disabled={uploadingImage}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <input
                      type="url"
                      value={tokenData.website}
                      onChange={(e) => setTokenData({ ...tokenData, website: e.target.value })}
                      placeholder="https://..."
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Twitter</label>
                    <input
                      type="text"
                      value={tokenData.twitter}
                      onChange={(e) => setTokenData({ ...tokenData, twitter: e.target.value })}
                      placeholder="@username"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telegram</label>
                    <input
                      type="text"
                      value={tokenData.telegram}
                      onChange={(e) => setTokenData({ ...tokenData, telegram: e.target.value })}
                      placeholder="@group"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="bg-accent border border-border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Creation Fee:</span>
                    <span className="font-bold">{calculateGasFee("medium")} DEMOS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Estimated Market Cap:</span>
                    <span className="font-bold">
                      {formatCurrency(tokenData.initialPrice * tokenData.initialSupply)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Creating Token...</span>
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
          ) : (
            <div className="card">
              <h3 className="text-xl font-bold mb-6">Launch NFT Collection</h3>

              {errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-500">Validation Errors:</p>
                      <ul className="text-sm text-red-400 mt-2 list-disc list-inside">
                        {errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleNFTCreation} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Collection Name *</label>
                    <input
                      type="text"
                      value={nftData.name}
                      onChange={(e) => setNftData({ ...nftData, name: e.target.value })}
                      placeholder="e.g., Cool Cats"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Symbol *</label>
                    <input
                      type="text"
                      value={nftData.symbol}
                      onChange={(e) =>
                        setNftData({ ...nftData, symbol: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g., COOL"
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={nftData.description}
                    onChange={(e) => setNftData({ ...nftData, description: e.target.value })}
                    placeholder="Describe your NFT collection..."
                    className="input-field min-h-[100px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Supply *</label>
                    <input
                      type="number"
                      value={nftData.supply}
                      onChange={(e) => setNftData({ ...nftData, supply: parseInt(e.target.value) })}
                      placeholder="10000"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Mint Price (DEMOS) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={nftData.price}
                      onChange={(e) =>
                        setNftData({ ...nftData, price: parseFloat(e.target.value) })
                      }
                      placeholder="0.1"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Royalties (%) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={nftData.royalties}
                      onChange={(e) =>
                        setNftData({ ...nftData, royalties: parseFloat(e.target.value) })
                      }
                      placeholder="5"
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Collection Image *</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {nftData.image ? (
                      <div className="space-y-2">
                        <p className="text-sm text-green-500">✓ Image uploaded: {nftData.image.name}</p>
                        <label htmlFor="nft-upload" className="btn-secondary cursor-pointer inline-block">
                          Change Image
                        </label>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className="mx-auto mb-2 text-gray-600" />
                        <p className="text-sm text-gray-400 mb-2">
                          {uploadingImage ? "Uploading to IPFS..." : "Upload collection image"}
                        </p>
                        <label htmlFor="nft-upload" className="btn-secondary cursor-pointer inline-block">
                          {uploadingImage ? <Loader2 className="animate-spin" size={16} /> : "Choose File"}
                        </label>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      id="nft-upload"
                      accept="image/*"
                      onChange={handleNFTImageUpload}
                      disabled={uploadingImage}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <input
                      type="url"
                      value={nftData.website}
                      onChange={(e) => setNftData({ ...nftData, website: e.target.value })}
                      placeholder="https://..."
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Twitter</label>
                    <input
                      type="text"
                      value={nftData.twitter}
                      onChange={(e) => setNftData({ ...nftData, twitter: e.target.value })}
                      placeholder="@username"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Discord</label>
                    <input
                      type="text"
                      value={nftData.discord}
                      onChange={(e) => setNftData({ ...nftData, discord: e.target.value })}
                      placeholder="discord.gg/..."
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="bg-accent border border-border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Deployment Fee:</span>
                    <span className="font-bold">{calculateGasFee("complex")} DEMOS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Mint Revenue:</span>
                    <span className="font-bold">{(nftData.price * nftData.supply).toFixed(2)} DEMOS</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Creating Collection...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={20} />
                      <span>Create Collection</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Trending Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} />
              <h3 className="font-bold">
                {activeType === "token" ? "Trending Tokens" : "Trending Collections"}
              </h3>
            </div>

            {activeType === "token" ? (
              <div className="space-y-3">
                {trendingTokens.length > 0 ? (
                  trendingTokens.map((token, i) => (
                    <div key={i} className="p-3 bg-black/40 border border-white/10 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-semibold">{token.symbol}</p>
                          <p className="text-xs text-gray-400">{token.name}</p>
                        </div>
                        <span className={getPriceChangeColor(token.change24h)}>
                          {formatPriceChange(token.change24h)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span>{formatCurrency(token.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>MCap:</span>
                          <span>${formatNumber(token.marketCap)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    <p className="text-sm">Loading trending tokens...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {trendingCollections.length > 0 ? (
                  trendingCollections.map((collection, i) => (
                    <div key={i} className="p-3 bg-black/40 border border-white/10 rounded-lg">
                      <div className="flex gap-2">
                        {collection.image && (
                          <img
                            src={collection.image}
                            alt={collection.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{collection.name}</p>
                          <div className="text-xs text-gray-400 mt-1">
                            <div className="flex justify-between">
                              <span>Floor:</span>
                              <span>{formatFloorPrice(collection.floorPrice)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    <p className="text-sm">Loading trending collections...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {txHash && (
            <div className="card bg-green-500/10 border-green-500">
              <h3 className="font-bold text-green-500 mb-2">Success!</h3>
              <p className="text-sm text-gray-300 mb-3">
                Your {activeType === "token" ? "token" : "NFT collection"} was created successfully!
              </p>
              <a
                href={`https://explorer.demos.sh/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white hover:underline flex items-center gap-2"
              >
                View Transaction <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
