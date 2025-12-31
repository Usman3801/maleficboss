"use client";

/**
 * Magic Eden API Integration
 * Documentation: https://api.magiceden.dev/
 */

const MAGIC_EDEN_API_BASE = "https://api-mainnet.magiceden.dev/v2";

export interface NFTCollection {
  symbol: string;
  name: string;
  description?: string;
  image?: string;
  twitter?: string;
  discord?: string;
  website?: string;
  categories?: string[];
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface LaunchpadCollection {
  name: string;
  symbol: string;
  description: string;
  image: File | null;
  supply: number;
  price: number;
  royalties: number;
  website?: string;
  twitter?: string;
  discord?: string;
}

/**
 * Get collection stats from Magic Eden
 */
export async function getCollectionStats(symbol: string): Promise<any> {
  try {
    const response = await fetch(
      `${MAGIC_EDEN_API_BASE}/collections/${symbol}/stats`
    );

    if (!response.ok) {
      throw new Error(`Magic Eden API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching collection stats:", error);
    return null;
  }
}

/**
 * Get trending collections
 */
export async function getTrendingCollections(): Promise<any[]> {
  try {
    const response = await fetch(
      `${MAGIC_EDEN_API_BASE}/marketplace/popular_collections`
    );

    if (!response.ok) {
      throw new Error(`Magic Eden API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching trending collections:", error);
    return [];
  }
}

/**
 * Get collection activities
 */
export async function getCollectionActivity(
  symbol: string,
  limit: number = 100
): Promise<any[]> {
  try {
    const response = await fetch(
      `${MAGIC_EDEN_API_BASE}/collections/${symbol}/activities?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Magic Eden API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching collection activity:", error);
    return [];
  }
}

/**
 * Search collections
 */
export async function searchCollections(query: string): Promise<any[]> {
  try {
    const response = await fetch(
      `${MAGIC_EDEN_API_BASE}/collections?search=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Magic Eden API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching collections:", error);
    return [];
  }
}

/**
 * Upload image to IPFS (simulated - requires actual IPFS service)
 */
export async function uploadToIPFS(file: File): Promise<string> {
  try {
    // In production, you would use a service like Pinata, NFT.Storage, or Web3.Storage
    // For now, we'll simulate the upload
    console.log("Uploading to IPFS:", file.name);

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Return mock IPFS hash
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    return `ipfs://${mockHash}`;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
}

/**
 * Create NFT collection metadata
 */
export function generateNFTMetadata(
  collection: LaunchpadCollection,
  tokenId: number
): NFTMetadata {
  return {
    name: `${collection.name} #${tokenId}`,
    description: collection.description,
    image: "", // Will be set after IPFS upload
    attributes: [
      {
        trait_type: "Collection",
        value: collection.name,
      },
      {
        trait_type: "Token ID",
        value: tokenId.toString(),
      },
    ],
  };
}

/**
 * Validate collection data
 */
export function validateCollectionData(
  collection: LaunchpadCollection
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!collection.name || collection.name.trim().length < 3) {
    errors.push("Collection name must be at least 3 characters");
  }

  if (!collection.symbol || collection.symbol.trim().length < 2) {
    errors.push("Symbol must be at least 2 characters");
  }

  if (!collection.description || collection.description.trim().length < 10) {
    errors.push("Description must be at least 10 characters");
  }

  if (collection.supply < 1 || collection.supply > 100000) {
    errors.push("Supply must be between 1 and 100,000");
  }

  if (collection.price < 0) {
    errors.push("Price must be positive");
  }

  if (collection.royalties < 0 || collection.royalties > 10) {
    errors.push("Royalties must be between 0% and 10%");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format price in SOL
 */
export function formatSOL(amount: number): string {
  return `${amount.toFixed(4)} SOL`;
}

/**
 * Format floor price
 */
export function formatFloorPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || isNaN(price)) {
    return "N/A";
  }
  return formatSOL(price);
}

/**
 * Calculate total mint cost
 */
export function calculateMintCost(
  price: number,
  quantity: number,
  royalties: number
): number {
  const basePrice = price * quantity;
  const royaltyFee = basePrice * (royalties / 100);
  return basePrice + royaltyFee;
}
