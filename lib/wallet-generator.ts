/**
 * Wallet Generation and Mnemonic Management
 * Uses ethers.js for BIP39 mnemonic generation and wallet creation
 */

import { ethers } from "ethers";

export interface GeneratedWallet {
  address: string;
  mnemonic: string;
  privateKey: string;
}

/**
 * Generate a new wallet with 12-word mnemonic phrase
 */
export function generateWallet(): GeneratedWallet {
  // Generate random wallet with mnemonic
  const wallet = ethers.Wallet.createRandom();

  return {
    address: wallet.address,
    mnemonic: wallet.mnemonic?.phrase || "",
    privateKey: wallet.privateKey,
  };
}

/**
 * Import wallet from mnemonic phrase
 */
export function importWalletFromMnemonic(mnemonic: string): GeneratedWallet {
  try {
    // Validate and create wallet from mnemonic
    const wallet = ethers.Wallet.fromPhrase(mnemonic.trim());

    return {
      address: wallet.address,
      mnemonic: wallet.mnemonic?.phrase || "",
      privateKey: wallet.privateKey,
    };
  } catch (error) {
    throw new Error("Invalid mnemonic phrase. Please check your 12 words.");
  }
}

/**
 * Validate mnemonic phrase
 */
export function validateMnemonic(mnemonic: string): boolean {
  try {
    ethers.Wallet.fromPhrase(mnemonic.trim());
    return true;
  } catch {
    return false;
  }
}

/**
 * Split mnemonic into array of words
 */
export function splitMnemonic(mnemonic: string): string[] {
  return mnemonic
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

/**
 * Join mnemonic words into single phrase
 */
export function joinMnemonic(words: string[]): string {
  return words.join(" ").trim();
}

/**
 * Auto-arrange pasted mnemonic into 12 boxes
 * If all words are pasted in first box, split them into array
 */
export function autoArrangeMnemonic(input: string): string[] {
  const words = splitMnemonic(input);

  // If we have exactly 12 words, return them
  if (words.length === 12) {
    return words;
  }

  // Otherwise return empty array to indicate invalid input
  return [];
}

/**
 * Store wallet data in localStorage (encrypted with password)
 */
export function storeWalletData(address: string, encryptedData: string): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("demos_wallet_address", address);
  localStorage.setItem("demos_wallet_data", encryptedData);
  localStorage.setItem("demos_wallet_connected", "true");
}

/**
 * Get stored wallet address
 */
export function getStoredWalletAddress(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("demos_wallet_address");
}

/**
 * Get stored wallet data
 */
export function getStoredWalletData(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("demos_wallet_data");
}

/**
 * Check if wallet is connected
 */
export function isWalletConnected(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("demos_wallet_connected") === "true";
}

/**
 * Clear wallet data from localStorage
 */
export function clearWalletData(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("demos_wallet_address");
  localStorage.removeItem("demos_wallet_data");
  localStorage.removeItem("demos_wallet_connected");
}

/**
 * Simple encryption for mnemonic (NOT production-grade, just basic obfuscation)
 * In production, use proper encryption libraries
 */
export function encryptMnemonic(mnemonic: string, password: string): string {
  // Very basic XOR encryption (NOT SECURE - for demo only)
  const encrypted = Array.from(mnemonic)
    .map((char, i) => {
      const keyChar = password.charCodeAt(i % password.length);
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
    })
    .join("");

  return btoa(encrypted); // Base64 encode
}

/**
 * Simple decryption for mnemonic
 */
export function decryptMnemonic(encrypted: string, password: string): string {
  try {
    const decoded = atob(encrypted); // Base64 decode

    // XOR decryption (same as encryption for XOR)
    const decrypted = Array.from(decoded)
      .map((char, i) => {
        const keyChar = password.charCodeAt(i % password.length);
        return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
      })
      .join("");

    return decrypted;
  } catch {
    throw new Error("Failed to decrypt mnemonic");
  }
}

/**
 * Connect wallet to Demos Network provider
 */
export async function connectGeneratedWallet(privateKey: string): Promise<void> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Ethereum provider not found");
  }

  try {
    // Switch to Demos Testnet
    const DEMOS_TESTNET_CHAIN_ID = "0x1E240"; // 123456 in hex

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: DEMOS_TESTNET_CHAIN_ID }],
    });
  } catch (switchError: any) {
    // If chain doesn't exist, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x1E240",
            chainName: "Demos Testnet",
            nativeCurrency: {
              name: "DEMOS",
              symbol: "DEMOS",
              decimals: 18,
            },
            rpcUrls: ["https://testnet-rpc.demos.network"],
            blockExplorerUrls: ["https://explorer.demos.sh"],
          },
        ],
      });
    }
  }
}
