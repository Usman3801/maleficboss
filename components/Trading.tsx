"use client";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Activity, Droplets, Percent, Wallet, ArrowUpRight, ArrowDownRight, ArrowDownUp, Settings, ChevronDown } from "lucide-react";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
}

interface LiquidityPool {
  name: string;
  symbol: string;
  supplyAPY: number;
  borrowAPY: number;
  utilization: number;
  totalLiquidity: number;
  availableLiquidity: number;
}

interface YieldVault {
  name: string;
  description: string;
  tvl: number;
  apy: number;
  risk: string;
}

export default function Trading() {
  const { isConnected } = useWalletConnection();
  const [activeSection, setActiveSection] = useState<"perps" | "spot" | "defi">("perps");
  const [perpPrices, setPerpPrices] = useState<CryptoPrice[]>([]);
  const [spotPrices, setSpotPrices] = useState<CryptoPrice[]>([]);
  const [defiPools, setDefiPools] = useState<LiquidityPool[]>([]);
  const [yieldVaults, setYieldVaults] = useState<YieldVault[]>([]);
  const [loading, setLoading] = useState(true);

  // Perps trading state
  const [selectedPair, setSelectedPair] = useState<CryptoPrice | null>(null);
  const [positionSide, setPositionSide] = useState<"long" | "short">("long");
  const [leverage, setLeverage] = useState(1);
  const [orderAmount, setOrderAmount] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);

  // DeFi state
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [defiAction, setDefiAction] = useState<"supply" | "borrow">("supply");
  const [defiAmount, setDefiAmount] = useState("");
  const [selectedVault, setSelectedVault] = useState<YieldVault | null>(null);
  const [vaultAmount, setVaultAmount] = useState("");
  const [userPosition, setUserPosition] = useState({ totalSupplied: 0, totalBorrowed: 0, healthFactor: 0, netAPY: 0 });

  // Spot/Swap state
  const [fromToken, setFromToken] = useState<CryptoPrice | null>(null);
  const [toToken, setToToken] = useState<CryptoPrice | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedPair) {
      generateChartData(selectedPair.price);
    }
  }, [selectedPair]);

  const generateChartData = (basePrice: number) => {
    const data = [];
    const points = 50;
    for (let i = 0; i < points; i++) {
      const variance = (Math.random() - 0.5) * basePrice * 0.05;
      data.push({
        time: new Date(Date.now() - (points - i) * 3600000).toLocaleTimeString(),
        price: basePrice + variance,
      });
    }
    setChartData(data);
  };

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchCryptoPrices(), fetchAavePools()]);
    } catch (error) {
      console.error("Failed to fetch market data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCryptoPrices = async () => {
    try {
      // Fetch top 100 cryptocurrencies by market cap from CoinGecko
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h"
      );

      if (!response.ok) throw new Error("Failed to fetch prices");

      const data = await response.json();

      const prices: CryptoPrice[] = data.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price || 0,
        change24h: coin.price_change_percentage_24h || 0,
        volume24h: coin.total_volume || 0,
      }));

      setPerpPrices(prices);
      setSpotPrices(prices);

      if (!selectedPair && prices.length > 0) {
        setSelectedPair(prices[0]);
      }

      // Set default swap tokens (BTC and ETH)
      if (!fromToken && prices.length > 0) {
        setFromToken(prices[0]); // BTC
      }
      if (!toToken && prices.length > 1) {
        setToToken(prices[1]); // ETH
      }
    } catch (error) {
      console.error("Failed to fetch crypto prices:", error);
      setPerpPrices([]);
      setSpotPrices([]);
    }
  };

  const fetchAavePools = async () => {
    try {
      // Mock data for liquidity pools (similar to Aave)
      const pools: LiquidityPool[] = [
        {
          name: "DEMOS",
          symbol: "DEMOS",
          supplyAPY: 4.50,
          borrowAPY: 6.80,
          utilization: 60.0,
          totalLiquidity: 5000000,
          availableLiquidity: 2000000,
        },
        {
          name: "USDC",
          symbol: "USD Coin",
          supplyAPY: 5.20,
          borrowAPY: 7.50,
          utilization: 70.0,
          totalLiquidity: 10000000,
          availableLiquidity: 3000000,
        },
        {
          name: "ETH",
          symbol: "Ethereum",
          supplyAPY: 3.80,
          borrowAPY: 5.20,
          utilization: 58.25,
          totalLiquidity: 8000000,
          availableLiquidity: 3340000,
        },
      ];

      const vaults: YieldVault[] = [
        {
          name: "DEMOS Stable Vault",
          description: "Stablecoin farming with auto-compounding",
          tvl: 12000000,
          apy: 8.50,
          risk: "LOW RISK",
        },
        {
          name: "ETH-DEMOS LP Vault",
          description: "Automated market making with fee optimization",
          tvl: 5500000,
          apy: 15.20,
          risk: "MEDIUM RISK",
        },
        {
          name: "Multi-Asset Yield",
          description: "Diversified yield farming strategy",
          tvl: 0,
          apy: 0,
          risk: "",
        },
      ];

      setDefiPools(pools);
      setYieldVaults(vaults);
      if (pools.length > 0) setSelectedPool(pools[0]);
      if (vaults.length > 0) setSelectedVault(vaults[0]);
    } catch (error) {
      console.error("Failed to fetch Aave pools:", error);
      setDefiPools([]);
      setYieldVaults([]);
    }
  };

  const handlePlaceOrder = () => {
    if (!orderAmount || parseFloat(orderAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    alert(`${positionSide.toUpperCase()} order placed: ${orderAmount} DEM at ${leverage}x leverage for ${selectedPair?.symbol}/USD`);
    setOrderAmount("");
  };

  const handleSupplyBorrow = () => {
    if (!defiAmount || parseFloat(defiAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!selectedPool) {
      alert("Please select a pool");
      return;
    }

    alert(`${defiAction === "supply" ? "Supplied" : "Borrowed"} ${defiAmount} ${selectedPool.name}. This would interact with Aave smart contracts.`);
    setDefiAmount("");
  };

  const handleVaultDeposit = () => {
    if (!vaultAmount || parseFloat(vaultAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!selectedVault) {
      alert("Please select a vault");
      return;
    }

    alert(`Deposited ${vaultAmount} DEMOS to ${selectedVault.name}. This would interact with yield vault smart contracts.`);
    setVaultAmount("");
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (fromToken && toToken && value) {
      const from = parseFloat(value);
      const rate = fromToken.price / toToken.price;
      setToAmount((from * rate).toFixed(6));
    } else {
      setToAmount("");
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (!fromToken || !toToken) {
      alert("Please select both tokens");
      return;
    }
    alert(`Swap ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}. This would execute on DEX.`);
    setFromAmount("");
    setToAmount("");
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Wallet size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect wallet to access trading features</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Trading</h2>

        {/* Section Tabs - Moved to right with white background */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveSection("perps")}
            className={`px-6 py-2.5 font-semibold rounded-lg border-2 transition-all ${
              activeSection === "perps"
                ? "bg-white text-black border-white"
                : "bg-transparent text-white border-white hover:bg-white hover:text-black"
            }`}
          >
            Perpetuals
          </button>
          <button
            onClick={() => setActiveSection("spot")}
            className={`px-6 py-2.5 font-semibold rounded-lg border-2 transition-all ${
              activeSection === "spot"
                ? "bg-white text-black border-white"
                : "bg-transparent text-white border-white hover:bg-white hover:text-black"
            }`}
          >
            Spot
          </button>
          <button
            onClick={() => setActiveSection("defi")}
            className={`px-6 py-2.5 font-semibold rounded-lg border-2 transition-all ${
              activeSection === "defi"
                ? "bg-white text-black border-white"
                : "bg-transparent text-white border-white hover:bg-white hover:text-black"
            }`}
          >
            DeFi
          </button>
        </div>
      </div>

      {/* Perpetuals Section */}
      {activeSection === "perps" && (
        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar - Market List */}
          <div className="col-span-3 bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 max-h-[800px] overflow-y-auto">
            <h3 className="font-bold mb-4 text-lg">Markets</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {perpPrices.map((crypto) => (
                  <button
                    key={crypto.symbol}
                    onClick={() => setSelectedPair(crypto)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedPair?.symbol === crypto.symbol
                        ? "bg-gray-800"
                        : "hover:bg-gray-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{crypto.symbol}/USD</span>
                      <span className={`text-xs font-semibold ${crypto.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {crypto.change24h >= 0 ? "+" : ""}{crypto.change24h.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">{crypto.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Trading Area */}
          <div className="col-span-6 space-y-4">
            {/* Price Header */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <div className="flex items-baseline gap-4 mb-2">
                <h2 className="text-3xl font-bold">{selectedPair?.symbol}/USD</h2>
                <span className="text-4xl font-bold">${selectedPair?.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${selectedPair && selectedPair.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {selectedPair && selectedPair.change24h >= 0 ? "+" : ""}{selectedPair?.change24h.toFixed(2)}%
                </span>
                <span className="text-sm text-gray-500">24h</span>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="time"
                    stroke="#666"
                    tick={{ fill: '#666', fontSize: 10 }}
                  />
                  <YAxis
                    stroke="#666"
                    tick={{ fill: '#666', fontSize: 12 }}
                    domain={['dataMin - 100', 'dataMax + 100']}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#ffffff"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Open Position */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <h3 className="font-bold mb-4 text-lg">Open Position</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPositionSide("long")}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    positionSide === "long"
                      ? "bg-green-500/20 border-green-500"
                      : "bg-gray-900 border-gray-700 hover:border-green-500"
                  }`}
                >
                  <ArrowUpRight className="mx-auto mb-2" size={32} />
                  <div className="font-bold text-lg">LONG</div>
                </button>
                <button
                  onClick={() => setPositionSide("short")}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    positionSide === "short"
                      ? "bg-red-500/20 border-red-500"
                      : "bg-gray-900 border-gray-700 hover:border-red-500"
                  }`}
                >
                  <ArrowDownRight className="mx-auto mb-2" size={32} />
                  <div className="font-bold text-lg">SHORT</div>
                </button>
              </div>

              {/* Leverage Slider */}
              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Leverage: {leverage}x</label>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1x</span>
                  <span>50x</span>
                  <span>100x</span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Amount (DEM)</label>
                <input
                  type="number"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-white focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">Position size: {orderAmount ? (parseFloat(orderAmount) * leverage).toFixed(2) : "0.00"} DEM</p>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                className={`w-full mt-6 py-4 rounded-lg font-bold text-lg ${
                  positionSide === "long"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Open {positionSide.toUpperCase()} Position
              </button>
            </div>
          </div>

          {/* Right Sidebar - Market Info */}
          <div className="col-span-3 space-y-4">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
              <h3 className="font-bold mb-4">Market Info</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-400">24h High</div>
                  <div className="text-lg font-semibold">${selectedPair ? (selectedPair.price * 1.05).toLocaleString() : "0"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">24h Low</div>
                  <div className="text-lg font-semibold">${selectedPair ? (selectedPair.price * 0.95).toLocaleString() : "0"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">24h Volume</div>
                  <div className="text-lg font-semibold">${selectedPair ? (selectedPair.volume24h / 1e6).toFixed(2) : "0"}M</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Market Cap</div>
                  <div className="text-lg font-semibold">${selectedPair ? (selectedPair.volume24h / 1e3).toFixed(2) : "0"}B</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Funding Rate</div>
                  <div className="text-lg font-semibold text-green-500">+0.01%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Next Funding</div>
                  <div className="text-lg font-semibold">4h 23m</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spot/Swap Section */}
      {activeSection === "spot" && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">Swap Tokens</h3>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Settings size={20} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              <p className="mt-4 text-gray-400">Loading tokens...</p>
            </div>
          ) : (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 space-y-4">
              {/* From Token */}
              <div className="bg-black/40 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">From</span>
                  <span className="text-sm text-gray-400">Balance: 0.00</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-3xl font-bold focus:outline-none"
                  />
                  <select
                    value={fromToken?.symbol || ""}
                    onChange={(e) => {
                      const token = spotPrices.find(t => t.symbol === e.target.value);
                      if (token) setFromToken(token);
                    }}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl font-semibold cursor-pointer transition-colors"
                  >
                    {spotPrices.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                {fromToken && (
                  <p className="text-sm text-gray-500 mt-2">${fromToken.price.toLocaleString()} per {fromToken.symbol}</p>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-2 z-10">
                <button
                  onClick={handleSwapTokens}
                  className="bg-gray-800 hover:bg-gray-700 border-4 border-[#1a1a1a] p-2 rounded-xl transition-all"
                >
                  <ArrowDownUp size={20} />
                </button>
              </div>

              {/* To Token */}
              <div className="bg-black/40 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">To</span>
                  <span className="text-sm text-gray-400">Balance: 0.00</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={toAmount}
                    readOnly
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-3xl font-bold focus:outline-none"
                  />
                  <select
                    value={toToken?.symbol || ""}
                    onChange={(e) => {
                      const token = spotPrices.find(t => t.symbol === e.target.value);
                      if (token) setToToken(token);
                    }}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl font-semibold cursor-pointer transition-colors"
                  >
                    {spotPrices.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                {toToken && (
                  <p className="text-sm text-gray-500 mt-2">${toToken.price.toLocaleString()} per {toToken.symbol}</p>
                )}
              </div>

              {/* Swap Details */}
              {fromAmount && toAmount && fromToken && toToken && (
                <div className="bg-black/40 border border-gray-700 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Rate</span>
                    <span>1 {fromToken.symbol} = {(fromToken.price / toToken.price).toFixed(6)} {toToken.symbol}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Slippage Tolerance</span>
                    <span>{slippage}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Network Fee</span>
                    <span>~0.001 DEM</span>
                  </div>
                </div>
              )}

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                disabled={!fromAmount || !toAmount}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed py-4 rounded-xl font-bold text-lg transition-all"
              >
                {fromAmount && toAmount ? "Swap Tokens" : "Enter Amount"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* DeFi Section - Redesigned */}
      {activeSection === "defi" && (
        <div className="space-y-6">
          {/* Your Position Header - Improved */}
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="text-blue-400" size={28} />
                Your Position
              </h3>
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                <span className="text-green-400 font-semibold">Healthy</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-black/30 rounded-xl p-4 border border-gray-700">
                <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-400" />
                  Total Supplied
                </p>
                <p className="text-3xl font-bold text-green-400">${userPosition.totalSupplied.toFixed(2)}</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-gray-700">
                <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <TrendingDown size={16} className="text-orange-400" />
                  Total Borrowed
                </p>
                <p className="text-3xl font-bold text-orange-400">${userPosition.totalBorrowed.toFixed(2)}</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-gray-700">
                <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Activity size={16} className="text-blue-400" />
                  Health Factor
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-3xl font-bold">{userPosition.healthFactor.toFixed(2)}%</p>
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-gray-700">
                <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Percent size={16} className="text-purple-400" />
                  Net APY
                </p>
                <p className="text-3xl font-bold text-purple-400">{userPosition.netAPY.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          {/* Main Grid: Liquidity Pools, Crypto Lending & Yield Vaults - Enhanced Design */}
          <div className="grid grid-cols-3 gap-6">
            {/* Liquidity Pools - Enhanced */}
            <div className="bg-gradient-to-br from-green-900/10 to-emerald-900/10 border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Droplets className="text-green-400" size={24} />
                </div>
                <h3 className="text-xl font-bold">Liquidity Pools</h3>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-400"></div>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {defiPools.map((pool, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedPool(pool)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:scale-105 ${
                        selectedPool?.name === pool.name
                          ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20"
                          : "border-gray-700/50 bg-black/20 hover:border-green-500/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-lg">{pool.name}</h4>
                          <p className="text-xs text-gray-400">{pool.symbol}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                        <div className="bg-black/30 rounded-lg p-2">
                          <p className="text-gray-500 mb-1">Supply APY</p>
                          <p className="font-bold text-green-400 text-sm">{pool.supplyAPY.toFixed(2)}%</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-2">
                          <p className="text-gray-500 mb-1">Borrow APY</p>
                          <p className="font-bold text-orange-400 text-sm">{pool.borrowAPY.toFixed(2)}%</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-2">
                          <p className="text-gray-500 mb-1">Utilization</p>
                          <p className="font-bold text-sm">{pool.utilization.toFixed(2)}%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400 bg-black/20 rounded-lg p-2">
                        <div>
                          <span className="text-gray-500">Total:</span> ${(pool.totalLiquidity / 1e6).toFixed(2)}M
                        </div>
                        <div>
                          <span className="text-gray-500">Available:</span> ${(pool.availableLiquidity / 1e6).toFixed(2)}M
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Interact with Pool - Enhanced */}
              <div className="bg-black/30 rounded-xl p-5 border border-green-500/20">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-green-400" />
                  Quick Action
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setDefiAction("supply")}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      defiAction === "supply"
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                        : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
                    }`}
                  >
                    Supply
                  </button>
                  <button
                    onClick={() => setDefiAction("borrow")}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      defiAction === "borrow"
                        ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/30"
                        : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
                    }`}
                  >
                    Borrow
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Amount</label>
                  <input
                    type="number"
                    value={defiAmount}
                    onChange={(e) => setDefiAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Selected: {selectedPool?.name || "None"}</p>
                </div>

                <button
                  onClick={handleSupplyBorrow}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black py-4 rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                >
                  {defiAction === "supply" ? "Supply Asset" : "Borrow Asset"}
                </button>
              </div>
            </div>

            {/* Crypto Lending - Enhanced */}
            <div className="bg-gradient-to-br from-blue-900/10 to-cyan-900/10 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Percent className="text-blue-400" size={24} />
                </div>
                <h3 className="text-xl font-bold">Crypto Lending</h3>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-4 rounded-xl border-2 border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-transparent hover:border-blue-500/50 transition-all hover:scale-105">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <DollarSign size={18} className="text-orange-400" />
                      BTC Lending
                    </h4>
                    <span className="text-xs bg-blue-500/30 text-blue-300 px-3 py-1 rounded-full font-semibold border border-blue-500/50">Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-gray-500 mb-1 flex items-center gap-1">
                        <TrendingUp size={12} />
                        Lend APY
                      </p>
                      <p className="font-bold text-green-400 text-lg">6.50%</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-gray-500 mb-1">Available</p>
                      <p className="font-bold text-lg">$2.5M</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-transparent hover:border-purple-500/50 transition-all hover:scale-105">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <DollarSign size={18} className="text-purple-400" />
                      ETH Lending
                    </h4>
                    <span className="text-xs bg-purple-500/30 text-purple-300 px-3 py-1 rounded-full font-semibold border border-purple-500/50">Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-gray-500 mb-1 flex items-center gap-1">
                        <TrendingUp size={12} />
                        Lend APY
                      </p>
                      <p className="font-bold text-green-400 text-lg">5.80%</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-gray-500 mb-1">Available</p>
                      <p className="font-bold text-lg">$4.2M</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border-2 border-green-500/30 bg-gradient-to-r from-green-900/20 to-transparent hover:border-green-500/50 transition-all hover:scale-105">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <DollarSign size={18} className="text-green-400" />
                      USDC Lending
                    </h4>
                    <span className="text-xs bg-green-500/30 text-green-300 px-3 py-1 rounded-full font-semibold border border-green-500/50">Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-gray-500 mb-1 flex items-center gap-1">
                        <TrendingUp size={12} />
                        Lend APY
                      </p>
                      <p className="font-bold text-green-400 text-lg">8.20%</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-gray-500 mb-1">Available</p>
                      <p className="font-bold text-lg">$6.8M</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lend Crypto - Enhanced */}
              <div className="bg-black/30 rounded-xl p-5 border border-blue-500/20">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Wallet size={18} className="text-blue-400" />
                  Lend Your Crypto
                </h4>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Select Asset</label>
                  <select className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors">
                    <option>BTC</option>
                    <option>ETH</option>
                    <option>USDC</option>
                    <option>DEMOS</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Amount</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-black py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40">
                  Lend Asset
                </button>
              </div>
            </div>

            {/* Yield Vaults - Enhanced */}
            <div className="bg-gradient-to-br from-purple-900/10 to-pink-900/10 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <TrendingUp className="text-purple-400" size={24} />
                </div>
                <h3 className="text-xl font-bold">Yield Vaults</h3>
              </div>

              <div className="space-y-3 mb-6">
                {yieldVaults.map((vault, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedVault(vault)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:scale-105 ${
                      selectedVault?.name === vault.name
                        ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                        : "border-gray-700/50 bg-black/20 hover:border-purple-500/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-base">{vault.name}</h4>
                      {vault.risk && (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                          vault.risk === "LOW RISK"
                            ? "bg-green-500/20 text-green-400 border-green-500/50"
                            : "bg-orange-500/20 text-orange-400 border-orange-500/50"
                        }`}>
                          {vault.risk}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">{vault.description}</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-black/30 rounded-lg p-3">
                        <p className="text-gray-500 mb-1 flex items-center gap-1">
                          <DollarSign size={12} />
                          TVL
                        </p>
                        <p className="font-bold text-lg">${(vault.tvl / 1e6).toFixed(2)}M</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <p className="text-gray-500 mb-1 flex items-center gap-1">
                          <Percent size={12} />
                          APY
                        </p>
                        <p className="font-bold text-purple-400 text-lg">{vault.apy.toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Deposit to Vault - Enhanced */}
              <div className="bg-black/30 rounded-xl p-5 border border-purple-500/20">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <DollarSign size={18} className="text-purple-400" />
                  Deposit to Vault
                </h4>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Amount (DEMOS)</label>
                  <input
                    type="number"
                    value={vaultAmount}
                    onChange={(e) => setVaultAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Selected: {selectedVault?.name || "None"}</p>
                </div>

                <button
                  onClick={handleVaultDeposit}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 flex items-center justify-center gap-2"
                >
                  <DollarSign size={20} />
                  Deposit to Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
