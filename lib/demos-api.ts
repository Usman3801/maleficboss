"use client";
import { Wallet } from "ethers";
import { getDemosConnector } from "./demos-node-connector-minimal";

// Demos Network API endpoints
const DEMOS_API_BASE = "https://api.demos.network"; // Update with actual API URL
const DEMOS_RPC_URL = "https://testnet-rpc.demos.network";

interface DemosIdentity {
  address: string;
  publicKey: string;
  exists: boolean;
  balance?: string;
  nonce?: number;
}

/**
 * Check if a Demos identity exists for a given mnemonic
 */
export async function checkDemosIdentity(mnemonic: string): Promise<DemosIdentity> {
  try {
    // Derive wallet from mnemonic
    const wallet = Wallet.fromPhrase(mnemonic);
    const address = wallet.address;
    const publicKey = wallet.publicKey;

    // Check if identity exists on Demos Network
    // Note: This API endpoint may not be available yet
    try {
      const response = await fetch(`${DEMOS_API_BASE}/identity/${address}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          address,
          publicKey,
          exists: true,
          balance: data.balance,
          nonce: data.nonce,
        };
      } else if (response.status === 404) {
        // Identity doesn't exist
        return {
          address,
          publicKey,
          exists: false,
        };
      }
    } catch (fetchError) {
      // API not available or network error - return basic identity info
      console.log("⚠️ Demos identity API not available:", fetchError);
    }

    // Fallback: return basic identity info
    return {
      address,
      publicKey,
      exists: false,
    };
  } catch (error) {
    console.error("Error checking Demos identity:", error);
    throw error;
  }
}

/**
 * Create a new Demos identity
 */
export async function createDemosIdentity(mnemonic: string): Promise<DemosIdentity> {
  try {
    // Derive wallet from mnemonic and connect to Demos node
    const connector = getDemosConnector({ network: "testnet" });
    const account = await connector.connectWallet(mnemonic);

    const address = account.address;
    const publicKey = account.publicKey;

    // Create identity on Demos Network
    // Note: This API endpoint may not be available yet
    try {
      const response = await fetch(`${DEMOS_API_BASE}/identity/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          publicKey,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Demos identity created successfully");
        return {
          address,
          publicKey,
          exists: true,
          balance: data.balance || "0",
          nonce: data.nonce || 0,
        };
      }
    } catch (fetchError) {
      // API not available - use on-chain data
      console.log("⚠️ Demos identity API not available, using on-chain data");
    }

    // Fallback: return on-chain data
    return {
      address,
      publicKey,
      exists: true,
      balance: account.balance,
      nonce: 0,
    };
  } catch (error) {
    console.error("Error creating Demos identity:", error);
    throw error;
  }
}

/**
 * Get or create Demos identity
 * Checks if identity exists, creates if it doesn't
 */
export async function getOrCreateDemosIdentity(mnemonic: string): Promise<DemosIdentity> {
  try {
    console.log("🔍 Connecting to Demos node and checking identity...");

    // Connect to Demos node using the minimal connector
    const connector = getDemosConnector({ network: "testnet" });
    const account = await connector.connectWallet(mnemonic);

    // Check balance to verify account exists on chain
    const balance = await connector.getBalance(account.address);
    const nonce = await connector.getNonce(account.address);

    const identity: DemosIdentity = {
      address: account.address,
      publicKey: account.publicKey,
      exists: true,
      balance,
      nonce,
    };

    console.log("✅ Demos identity ready:", identity.address);
    console.log("   Balance:", balance, "wei");
    console.log("   Nonce:", nonce);

    return identity;
  } catch (error) {
    console.error("Error in getOrCreateDemosIdentity:", error);
    throw error;
  }
}

/**
 * Get Demos account balance
 */
export async function getDemosBalance(address: string): Promise<string> {
  try {
    // Use the connector for on-chain balance instead of API
    const connector = getDemosConnector({ network: "testnet" });
    const balance = await connector.getBalance(address);
    return balance;
  } catch (error) {
    console.error("Error fetching Demos balance:", error);
    return "0";
  }
}

/**
 * Store Demos identity in localStorage
 */
export function storeDemosIdentity(identity: DemosIdentity): void {
  try {
    localStorage.setItem("demos_identity", JSON.stringify(identity));
  } catch (error) {
    console.error("Error storing Demos identity:", error);
  }
}

/**
 * Get stored Demos identity from localStorage
 */
export function getStoredDemosIdentity(): DemosIdentity | null {
  try {
    const stored = localStorage.getItem("demos_identity");
    if (stored) {
      return JSON.parse(stored) as DemosIdentity;
    }
  } catch (error) {
    console.error("Error retrieving Demos identity:", error);
  }
  return null;
}

/**
 * Clear stored Demos identity
 */
export function clearDemosIdentity(): void {
  try {
    localStorage.removeItem("demos_identity");
  } catch (error) {
    console.error("Error clearing Demos identity:", error);
  }
}
