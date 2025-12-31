"use client";

/**
 * Pump.fun API Integration
 * For token creation and bonding curve mechanics
 */

const PUMPFUN_API_BASE = "https://pump.fun/api";

export interface TokenData {
  name: string;
  symbol: string;
  description: string;
  image: File | null;
  twitter?: string;
  telegram?: string;
  website?: string;
  initialSupply: number;
  initialPrice: number;
}

export interface BondingCurveConfig {
  initialPrice: number;
  targetPrice: number;
  supply: number;
  curveType: "linear" | "exponential" | "logarithmic";
}

export interface TokenStats {
  price: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  transactions: number;
  liquidity: number;
}

/**
 * Calculate bonding curve price
 */
export function calculateBondingCurvePrice(
  supply: number,
  config: BondingCurveConfig
): number {
  const { initialPrice, targetPrice, supply: maxSupply, curveType } = config;
  const progress = supply / maxSupply;

  switch (curveType) {
    case "linear":
      return initialPrice + (targetPrice - initialPrice) * progress;

    case "exponential":
      const k = Math.log(targetPrice / initialPrice);
      return initialPrice * Math.exp(k * progress);

    case "logarithmic":
      const scale = targetPrice - initialPrice;
      return initialPrice + scale * Math.log(1 + 9 * progress) / Math.log(10);

    default:
      return initialPrice;
  }
}

/**
 * Calculate market cap
 */
export function calculateMarketCap(price: number, supply: number): number {
  return price * supply;
}

/**
 * Estimate buy amount
 */
export function estimateBuyAmount(
  investAmount: number,
  currentPrice: number,
  slippage: number = 0.5
): number {
  const slippageMultiplier = 1 - slippage / 100;
  const estimatedTokens = investAmount / currentPrice;
  return estimatedTokens * slippageMultiplier;
}

/**
 * Estimate sell amount
 */
export function estimateSellAmount(
  tokenAmount: number,
  currentPrice: number,
  slippage: number = 0.5
): number {
  const slippageMultiplier = 1 - slippage / 100;
  const estimatedValue = tokenAmount * currentPrice;
  return estimatedValue * slippageMultiplier;
}

/**
 * Get trending tokens
 */
export async function getTrendingTokens(): Promise<any[]> {
  try {
    // Simulate API call - replace with actual endpoint when available
    console.log("Fetching trending tokens from Pump.fun");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock data
    return [
      {
        symbol: "PUMP",
        name: "Pump Token",
        price: 0.00123,
        change24h: 45.2,
        volume24h: 125000,
        marketCap: 1500000,
      },
      {
        symbol: "MOON",
        name: "Moon Shot",
        price: 0.00089,
        change24h: 89.5,
        volume24h: 98000,
        marketCap: 890000,
      },
      {
        symbol: "DEGEN",
        name: "Degen Coin",
        price: 0.00156,
        change24h: -12.3,
        volume24h: 76000,
        marketCap: 780000,
      },
    ];
  } catch (error) {
    console.error("Error fetching trending tokens:", error);
    return [];
  }
}

/**
 * Create new token
 */
export async function createToken(tokenData: TokenData): Promise<string> {
  try {
    console.log("Creating token:", tokenData);

    // Validate token data
    const validation = validateTokenData(tokenData);
    if (!validation.valid) {
      throw new Error(validation.errors.join(", "));
    }

    // Simulate token creation
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Return mock transaction hash
    const txHash = "0x" + Math.random().toString(16).substr(2, 64);
    return txHash;
  } catch (error) {
    console.error("Error creating token:", error);
    throw error;
  }
}

/**
 * Validate token data
 */
export function validateTokenData(
  tokenData: TokenData
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!tokenData.name || tokenData.name.trim().length < 3) {
    errors.push("Token name must be at least 3 characters");
  }

  if (!tokenData.symbol || tokenData.symbol.trim().length < 2) {
    errors.push("Symbol must be at least 2 characters");
  }

  if (tokenData.symbol && tokenData.symbol.length > 10) {
    errors.push("Symbol must be 10 characters or less");
  }

  if (!tokenData.description || tokenData.description.trim().length < 20) {
    errors.push("Description must be at least 20 characters");
  }

  if (tokenData.initialSupply < 1000000 || tokenData.initialSupply > 1000000000000) {
    errors.push("Initial supply must be between 1M and 1T");
  }

  if (tokenData.initialPrice <= 0) {
    errors.push("Initial price must be greater than 0");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Upload token image
 */
export async function uploadTokenImage(file: File): Promise<string> {
  try {
    console.log("Uploading token image:", file.name);

    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      throw new Error("Image must be less than 5MB");
    }

    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Return mock URL
    const mockUrl = `https://storage.pump.fun/images/${Math.random().toString(36).substring(7)}.png`;
    return mockUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

/**
 * Format percentage change
 */
export function formatPriceChange(change: number | null | undefined): string {
  if (change === null || change === undefined || isNaN(change)) {
    return "0.00%";
  }
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Get price change color
 */
export function getPriceChangeColor(change: number | null | undefined): string {
  if (change === null || change === undefined || isNaN(change)) {
    return "text-gray-500";
  }
  return change >= 0 ? "text-green-500" : "text-red-500";
}

/**
 * Format large numbers
 */
export function formatNumber(num: number): string {
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B`;
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M`;
  }
  if (num >= 1e3) {
    return `${(num / 1e3).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(amount);
}

/**
 * Calculate estimated gas fee
 */
export function calculateGasFee(
  complexity: "simple" | "medium" | "complex"
): number {
  const baseFee = 0.001; // Base fee in DEMOS

  switch (complexity) {
    case "simple":
      return baseFee;
    case "medium":
      return baseFee * 2;
    case "complex":
      return baseFee * 5;
    default:
      return baseFee;
  }
}
