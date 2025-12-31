"use client";

// CoinGecko API (Free tier)
const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

export interface TokenPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  image?: string;
}

export interface MarketChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

/**
 * Get real-time prices for multiple coins
 */
export async function getTokenPrices(
  coinIds: string[] = ["bitcoin", "ethereum", "solana", "cardano", "polkadot"]
): Promise<TokenPrice[]> {
  try {
    const ids = coinIds.join(",");
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching token prices:", error);
    return [];
  }
}

/**
 * Get specific token price
 */
export async function getTokenPrice(coinId: string): Promise<number> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data[coinId]?.usd || 0;
  } catch (error) {
    console.error(`Error fetching price for ${coinId}:`, error);
    return 0;
  }
}

/**
 * Get historical market data (chart)
 */
export async function getMarketChart(
  coinId: string,
  days: number = 7
): Promise<MarketChartData | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching market chart for ${coinId}:`, error);
    return null;
  }
}

/**
 * Search for coins
 */
export async function searchCoins(query: string): Promise<any[]> {
  try {
    const response = await fetch(`${COINGECKO_API_BASE}/search?query=${query}`);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.coins || [];
  } catch (error) {
    console.error("Error searching coins:", error);
    return [];
  }
}

/**
 * Get trending coins
 */
export async function getTrendingCoins(): Promise<any[]> {
  try {
    const response = await fetch(`${COINGECKO_API_BASE}/search/trending`);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.coins || [];
  } catch (error) {
    console.error("Error fetching trending coins:", error);
    return [];
  }
}

/**
 * Get global market data
 */
export async function getGlobalMarketData(): Promise<any> {
  try {
    const response = await fetch(`${COINGECKO_API_BASE}/global`);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || {};
  } catch (error) {
    console.error("Error fetching global market data:", error);
    return {};
  }
}

/**
 * Format number to USD currency
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0.00%";
  }
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Get color for price change
 */
export function getPriceChangeColor(change: number | null | undefined): string {
  if (change === null || change === undefined || isNaN(change)) {
    return "text-gray-500";
  }
  return change >= 0 ? "text-green-500" : "text-red-500";
}
