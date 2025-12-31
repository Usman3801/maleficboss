"use client";
import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useWallet } from "@/contexts/WalletContext";
import { TrendingUp, TrendingDown, Loader2, ArrowRightLeft, Settings, ExternalLink, RefreshCw, Droplet, Vault } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  getTokenPrices,
  getMarketChart,
  getTrendingCoins,
  formatUSD,
  formatPercentage,
  getPriceChangeColor,
  type TokenPrice,
  type MarketChartData,
} from "@/lib/market-data";
import {
  getAavePools,
  getUserPosition,
  getVaults,
  supplyToPool,
  borrowFromPool,
  depositToVault,
  formatAPY,
  formatTVL,
  formatUtilization,
  getHealthFactorColor,
  formatHealthFactor,
  getRiskColor,
  type LiquidityPool,
  type UserPosition,
  type VaultData,
} from "@/lib/aave-api";

// Map CoinGecko IDs to trading pairs - expanded list
const COIN_IDS = [
  "bitcoin", "ethereum", "binancecoin", "solana", "cardano", "polkadot",
  "matic-network", "avalanche-2", "chainlink", "uniswap", "litecoin",
  "cosmos", "stellar", "algorand", "near", "aptos"
];

export default function Trading() {
  const { isConnected, address } = useWallet();
  const [mode, setMode] = useState<"spot" | "perps" | "defi">("perps");
  const [tradingPairs, setTradingPairs] = useState<TokenPrice[]>([]);
  const [selectedPair, setSelectedPair] = useState<TokenPrice | null>(null);
  const [position, setPosition] = useState<"long" | "short">("long");
  const [leverage, setLeverage] = useState(1);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingPrices, setFetchingPrices] = useState(true);
  const [txHash, setTxHash] = useState("");

  // Market data
  const [chartData, setChartData] = useState<MarketChartData | null>(null);
  const [trendingCoins, setTrendingCoins] = useState<any[]>([]);
  const [slippage, setSlippage] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);

  // Spot swap state
  const [fromToken, setFromToken] = useState("DEMOS");
  const [toToken, setToToken] = useState("ETH");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  // DeFi state
  const [liquidityPools, setLiquidityPools] = useState<LiquidityPool[]>([]);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [selectedVault, setSelectedVault] = useState<VaultData | null>(null);
  const [defiAmount, setDefiAmount] = useState("");
  const [defiAction, setDefiAction] = useState<"supply" | "borrow" | "vault">("supply");

  // Fetch token prices on mount and refresh every 30 seconds
  useEffect(() => {
    const fetchPrices = async () => {
      setFetchingPrices(true);
      try {
        const prices = await getTokenPrices(COIN_IDS);
        setTradingPairs(prices);

        if (!selectedPair && prices.length > 0) {
          setSelectedPair(prices[0]);
        }
      } catch (error) {
        console.error("Failed to fetch token prices:", error);
      } finally {
        setFetchingPrices(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch trending coins
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const trending = await getTrendingCoins();
        setTrendingCoins(trending);
      } catch (error) {
        console.error("Failed to fetch trending coins:", error);
      }
    };

    fetchTrending();
  }, []);

  // Fetch DeFi data when DeFi mode is selected
  useEffect(() => {
    if (mode === "defi" && isConnected) {
      const fetchDefiData = async () => {
        try {
          const [pools, position, vaultsData] = await Promise.all([
            getAavePools(),
            getUserPosition(address || ""),
            getVaults(),
          ]);

          setLiquidityPools(pools);
          setUserPosition(position);
          setVaults(vaultsData);

          if (!selectedPool && pools.length > 0) {
            setSelectedPool(pools[0]);
          }
          if (!selectedVault && vaultsData.length > 0) {
            setSelectedVault(vaultsData[0]);
          }
        } catch (error) {
          console.error("Failed to fetch DeFi data:", error);
        }
      };

      fetchDefiData();
    }
  }, [mode, isConnected, address]);

  // Fetch chart data when selected pair changes
  useEffect(() => {
    if (!selectedPair) return;

    const fetchChart = async () => {
      try {
        const data = await getMarketChart(selectedPair.id, 7);
        setChartData(data);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      }
    };

    fetchChart();
  }, [selectedPair]);

  // Manual refresh function
  const handleRefreshPrices = async () => {
    setFetchingPrices(true);
    try {
      const prices = await getTokenPrices(COIN_IDS);
      setTradingPairs(prices);

      // Update selected pair with new data
      if (selectedPair) {
        const updatedPair = prices.find(p => p.id === selectedPair.id);
        if (updatedPair) {
          setSelectedPair(updatedPair);
        }
      }
    } catch (error) {
      console.error("Failed to refresh prices:", error);
    } finally {
      setFetchingPrices(false);
    }
  };

  const handlePerpsTrade = async () => {
    if (!isConnected || !amount || !selectedPair) return;
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const mockTxHash = "0x" + Math.random().toString(16).substring(2, 66);
      setTxHash(mockTxHash);
      alert(`${position.toUpperCase()} position opened for ${selectedPair.symbol.toUpperCase()}/USD!\nView on Explorer: https://explorer.demos.sh/tx/${mockTxHash}`);
      setAmount("");
    } catch (error) {
      console.error(error);
      alert("Failed to open position");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!isConnected || !fromAmount) return;
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const mockTxHash = "0x" + Math.random().toString(16).substring(2, 66);
      setTxHash(mockTxHash);
      alert(`Swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}!\nView on Explorer: https://explorer.demos.sh/tx/${mockTxHash}`);
      setFromAmount("");
      setToAmount("");
    } catch (error) {
      console.error(error);
      alert("Swap failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDefiAction = async () => {
    if (!isConnected || !defiAmount) return;
    setLoading(true);
    try {
      let txHash = "";

      if (defiAction === "supply" && selectedPool) {
        txHash = await supplyToPool(selectedPool.id, parseFloat(defiAmount));
        alert(`Supplied ${defiAmount} ${selectedPool.symbol} to pool!\nView on Explorer: https://explorer.demos.sh/tx/${txHash}`);
      } else if (defiAction === "borrow" && selectedPool) {
        txHash = await borrowFromPool(selectedPool.id, parseFloat(defiAmount));
        alert(`Borrowed ${defiAmount} ${selectedPool.symbol} from pool!\nView on Explorer: https://explorer.demos.sh/tx/${txHash}`);
      } else if (defiAction === "vault" && selectedVault) {
        txHash = await depositToVault(selectedVault.name, parseFloat(defiAmount));
        alert(`Deposited ${defiAmount} DEMOS to ${selectedVault.name}!\nView on Explorer: https://explorer.demos.sh/tx/${txHash}`);
      }

      setTxHash(txHash);
      setDefiAmount("");

      // Refresh user position
      if (address) {
        const position = await getUserPosition(address);
        setUserPosition(position);
      }
    } catch (error) {
      console.error(error);
      alert("DeFi action failed");
    } finally {
      setLoading(false);
    }
  };

  const calculateToAmount = (amount: string) => {
    if (!amount || !selectedPair) return "";
    const rate = selectedPair.current_price / 1000;
    return (parseFloat(amount) * rate).toFixed(6);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(calculateToAmount(value));
  };

  // Format chart data for Recharts
  const formattedChartData = chartData?.prices.map(([timestamp, price]) => ({
    time: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: price,
  })) || [];

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <TrendingUp size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect wallet to start trading</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Trading</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefreshPrices}
            disabled={fetchingPrices}
            className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors flex items-center gap-2"
            title="Refresh Prices"
          >
            <RefreshCw size={18} className={fetchingPrices ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setMode("perps")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              mode === "perps" ? "bg-white text-black" : "bg-secondary border border-border"
            }`}
          >
            Perpetuals
          </button>
          <button
            onClick={() => setMode("spot")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              mode === "spot" ? "bg-white text-black" : "bg-secondary border border-border"
            }`}
          >
            Spot
          </button>
          <button
            onClick={() => setMode("defi")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              mode === "defi" ? "bg-white text-black" : "bg-secondary border border-border"
            }`}
          >
            DeFi
          </button>
        </div>
      </div>

      {mode === "perps" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Market List */}
          <div className="card">
            <h3 className="font-bold mb-4">Markets</h3>
            {fetchingPrices && tradingPairs.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : (
              <div className="space-y-2">
                {tradingPairs.map((pair) => (
                  <button
                    key={pair.id}
                    onClick={() => setSelectedPair(pair)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedPair?.id === pair.id
                        ? "bg-white/10 border border-white"
                        : "hover:bg-accent border border-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{pair.symbol.toUpperCase()}/USD</div>
                        <div className="text-xs text-gray-400">{pair.name}</div>
                      </div>
                      <div className={getPriceChangeColor(pair.price_change_percentage_24h)}>
                        {formatPercentage(pair.price_change_percentage_24h)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chart & Trading */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Chart */}
            {selectedPair ? (
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedPair.symbol.toUpperCase()}/USD</h3>
                    <div className="text-3xl font-bold mt-1">{formatUSD(selectedPair.current_price)}</div>
                    <div className={`text-sm ${getPriceChangeColor(selectedPair.price_change_percentage_24h)}`}>
                      {formatPercentage(selectedPair.price_change_percentage_24h)} 24h
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-400">24h High</div>
                    <div className="font-semibold">{formatUSD(selectedPair.high_24h)}</div>
                    <div className="text-gray-400 mt-2">24h Low</div>
                    <div className="font-semibold">{formatUSD(selectedPair.low_24h)}</div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={formattedChartData}>
                    <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#666" domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: "8px" }}
                      formatter={(value: any) => formatUSD(parseFloat(value))}
                    />
                    <Line type="monotone" dataKey="price" stroke="#ffffff" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="card">
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              </div>
            )}

            {/* Trading Form */}
            <div className="card">
              <h3 className="text-xl font-bold mb-6">Open Position</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPosition("long")}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      position === "long"
                        ? "border-green-500 bg-green-500/10"
                        : "border-border hover:border-green-500/50"
                    }`}
                  >
                    <TrendingUp className="mx-auto mb-2" size={24} />
                    <div className="font-bold">LONG</div>
                  </button>
                  <button
                    onClick={() => setPosition("short")}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      position === "short"
                        ? "border-red-500 bg-red-500/10"
                        : "border-border hover:border-red-500/50"
                    }`}
                  >
                    <TrendingDown className="mx-auto mb-2" size={24} />
                    <div className="font-bold">SHORT</div>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Leverage: {leverage}x</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={leverage}
                    onChange={(e) => setLeverage(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1x</span>
                    <span>5x</span>
                    <span>10x</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amount (DEMOS)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="input-field"
                  />
                </div>

                <button
                  onClick={handlePerpsTrade}
                  disabled={loading || !amount}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Opening...</span>
                    </>
                  ) : (
                    <span>Open {position.toUpperCase()} Position</span>
                  )}
                </button>

                {txHash && (
                  <a
                    href={`https://explorer.demos.sh/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white hover:underline flex items-center justify-center gap-2"
                  >
                    View Transaction <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Position Info */}
          <div className="card">
            <h3 className="text-xl font-bold mb-6">Market Info</h3>
            {selectedPair ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Current Price</div>
                  <div className="text-lg font-bold">{formatUSD(selectedPair.current_price)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Market Cap</div>
                  <div className="text-lg font-bold">
                    ${(selectedPair.market_cap / 1e9).toFixed(2)}B
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">24h Volume</div>
                  <div className="text-lg font-bold">
                    ${(selectedPair.total_volume / 1e9).toFixed(2)}B
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">24h Change</div>
                  <div className={`text-lg font-bold ${getPriceChangeColor(selectedPair.price_change_percentage_24h)}`}>
                    {formatPercentage(selectedPair.price_change_percentage_24h)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Price Change</div>
                  <div className={`text-lg font-bold ${getPriceChangeColor(selectedPair.price_change_24h)}`}>
                    {formatUSD(Math.abs(selectedPair.price_change_24h))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin" size={24} />
              </div>
            )}
          </div>
        </div>
      ) : mode === "spot" ? (
        // Spot Trading UI
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Spot Swap</h2>
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
                    <button
                      key={val}
                      onClick={() => setSlippage(val)}
                      className={`px-4 py-2 rounded-lg border ${
                        slippage === val ? "border-white bg-white text-black" : "border-border"
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="space-y-4">
              <div className="bg-accent border border-border rounded-lg p-4">
                <label className="text-sm text-gray-400 mb-2 block">From</label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.0"
                    className="bg-transparent text-2xl font-bold outline-none flex-1"
                  />
                  <select className="bg-secondary border border-border rounded-lg px-4 py-2" value={fromToken} onChange={(e) => setFromToken(e.target.value)}>
                    <option value="DEMOS">DEMOS</option>
                    <option value="ETH">ETH</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-center">
                <button className="p-2 rounded-lg border border-border hover:bg-secondary">
                  <ArrowRightLeft size={20} />
                </button>
              </div>

              <div className="bg-accent border border-border rounded-lg p-4">
                <label className="text-sm text-gray-400 mb-2 block">To</label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={toAmount}
                    readOnly
                    placeholder="0.0"
                    className="bg-transparent text-2xl font-bold outline-none flex-1"
                  />
                  <select className="bg-secondary border border-border rounded-lg px-4 py-2" value={toToken} onChange={(e) => setToToken(e.target.value)}>
                    <option value="ETH">ETH</option>
                    <option value="DEMOS">DEMOS</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>

              {fromAmount && toAmount && (
                <div className="bg-secondary border border-border rounded-lg p-4 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Rate</span>
                    <span>1 {fromToken} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network Fee</span>
                    <span>~0.001 DEMOS</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleSwap}
                disabled={loading || !fromAmount}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Swapping...</span>
                  </>
                ) : (
                  <>
                    <ArrowRightLeft size={20} />
                    <span>Swap</span>
                  </>
                )}
              </button>

              {txHash && (
                <a
                  href={`https://explorer.demos.sh/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white hover:underline flex items-center justify-center gap-2"
                >
                  View Transaction <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      ) : mode === "defi" ? (
        // DeFi UI
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Position Card */}
          {userPosition && (
            <div className="card lg:col-span-3">
              <h3 className="text-xl font-bold mb-4">Your Position</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Total Supplied</div>
                  <div className="text-2xl font-bold">{formatTVL(userPosition.supplied)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Total Borrowed</div>
                  <div className="text-2xl font-bold">{formatTVL(userPosition.borrowed)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Health Factor</div>
                  <div className={`text-2xl font-bold ${getHealthFactorColor(userPosition.healthFactor)}`}>
                    {formatHealthFactor(userPosition.healthFactor)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Net APY</div>
                  <div className="text-2xl font-bold text-green-500">{formatAPY(userPosition.netAPY)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Liquidity Pools */}
          <div className="card lg:col-span-2">
            <h3 className="text-xl font-bold mb-4">Liquidity Pools</h3>
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {liquidityPools.map((pool) => (
                <button
                  key={pool.id}
                  onClick={() => setSelectedPool(pool)}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    selectedPool?.id === pool.id
                      ? "bg-white/10 border border-white"
                      : "bg-secondary border border-border hover:bg-accent"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-bold text-lg">{pool.symbol}</div>
                    <div className="text-sm text-gray-400">{pool.name}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-gray-400">Supply APY</div>
                      <div className="font-semibold text-green-500">{formatAPY(pool.supplyAPY)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Borrow APY</div>
                      <div className="font-semibold text-yellow-500">{formatAPY(pool.borrowAPY)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Utilization</div>
                      <div className="font-semibold">{formatUtilization(pool.utilizationRate)}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Total Liquidity: {formatTVL(pool.totalLiquidity)} | Available: {formatTVL(pool.availableLiquidity)}
                  </div>
                </button>
              ))}
            </div>

            {/* Supply/Borrow Form */}
            {selectedPool && (
              <div className="border-t border-border pt-6">
                <h4 className="font-bold mb-4">Interact with {selectedPool.symbol}</h4>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setDefiAction("supply")}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                      defiAction === "supply" ? "bg-green-500 text-black" : "bg-secondary border border-border"
                    }`}
                  >
                    Supply
                  </button>
                  <button
                    onClick={() => setDefiAction("borrow")}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                      defiAction === "borrow" ? "bg-yellow-500 text-black" : "bg-secondary border border-border"
                    }`}
                  >
                    Borrow
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount ({selectedPool.symbol})</label>
                    <input
                      type="number"
                      value={defiAmount}
                      onChange={(e) => setDefiAmount(e.target.value)}
                      placeholder="0.0"
                      className="input-field"
                    />
                  </div>

                  <button
                    onClick={handleDefiAction}
                    disabled={loading || !defiAmount}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>{defiAction === "supply" ? "Supply" : "Borrow"} {selectedPool.symbol}</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Vaults */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Yield Vaults</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {vaults.map((vault) => (
                <button
                  key={vault.name}
                  onClick={() => setSelectedVault(vault)}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    selectedVault?.name === vault.name
                      ? "bg-white/10 border border-white"
                      : "bg-secondary border border-border hover:bg-accent"
                  }`}
                >
                  <div className="font-bold mb-1">{vault.name}</div>
                  <div className="text-sm text-gray-400 mb-2">{vault.strategy}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-gray-400">TVL</div>
                      <div className="font-semibold">{formatTVL(vault.tvl)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">APY</div>
                      <div className="font-semibold text-green-500">{formatAPY(vault.apy)}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className={`${getRiskColor(vault.risk)} font-semibold`}>
                      {vault.risk.toUpperCase()} RISK
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {selectedVault && (
              <div className="border-t border-border pt-4 mt-4">
                <h4 className="font-bold mb-4">Deposit to Vault</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (DEMOS)</label>
                    <input
                      type="number"
                      value={defiAmount}
                      onChange={(e) => setDefiAmount(e.target.value)}
                      placeholder="0.0"
                      className="input-field"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setDefiAction("vault");
                      handleDefiAction();
                    }}
                    disabled={loading || !defiAmount}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Depositing...</span>
                      </>
                    ) : (
                      <>
                        <Vault size={20} />
                        <span>Deposit to Vault</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
