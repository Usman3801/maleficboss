"use client";

/**
 * Demos Node Connector
 * Integrates with Demos Network using @kynesyslabs/demosdk
 * Updated: 2025-12-31 - Fixed to use actual Demos SDK API
 */

import { Demos } from "@kynesyslabs/demosdk/websdk";

// Demos Network Configuration
const DEMOS_CONFIG = {
  // Production RPC endpoints
  mainnet: "https://rpc.demos.network",
  testnet: "https://testnet-rpc.demos.network",

  // Chain IDs
  mainnetChainId: 1234567, // Update with actual chain ID
  testnetChainId: 123456,   // Update with actual chain ID

  // Explorer
  explorer: "https://explorer.demos.sh",
};

export interface DemosNodeConfig {
  network?: "mainnet" | "testnet";
  rpcUrl?: string;
}

export interface DemosAccount {
  address: string;
  publicKey: string;
  balance: string;
  nonce: number;
}

export interface DemosTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  data?: string;
  nonce: number;
}

/**
 * Demos Node Connector Class
 * Provides interface to interact with Demos blockchain
 */
export class DemosNodeConnector {
  private demosClient: Demos;
  private network: "mainnet" | "testnet";
  private rpcUrl: string;

  constructor(config: DemosNodeConfig = {}) {
    this.network = config.network || "testnet";
    this.rpcUrl = config.rpcUrl || DEMOS_CONFIG[this.network];

    // Initialize Demos SDK client
    this.demosClient = new Demos();

    console.log(`🌐 Demos SDK initialized for ${this.network}`);
  }

  /**
   * Initialize connection to RPC
   */
  async initialize(): Promise<boolean> {
    try {
      const connected = await this.demosClient.connect(this.rpcUrl);
      console.log(`🌐 Connected to Demos ${this.network} at ${this.rpcUrl}`);
      return connected;
    } catch (error) {
      console.error("Failed to connect to RPC:", error);
      throw error;
    }
  }

  /**
   * Get Demos client instance
   */
  getClient(): Demos {
    return this.demosClient;
  }

  /**
   * Connect wallet with mnemonic
   */
  async connectWallet(mnemonic: string): Promise<DemosAccount> {
    try {
      // Ensure RPC is connected first
      if (!this.demosClient.connected) {
        await this.initialize();
      }

      // Connect wallet using Demos SDK
      const publicKey = await this.demosClient.connectWallet(mnemonic);
      const address = this.demosClient.getAddress();

      // Get account info
      const addressInfo = await this.demosClient.getAddressInfo(address);
      const nonce = await this.demosClient.getAddressNonce(address);

      const account: DemosAccount = {
        address,
        publicKey,
        balance: addressInfo?.balance?.toString() || "0",
        nonce,
      };

      console.log("✅ Wallet connected to Demos node:", account.address);
      return account;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<string> {
    try {
      const addressInfo = await this.demosClient.getAddressInfo(address);
      return addressInfo?.balance?.toString() || "0";
    } catch (error) {
      console.error("Failed to get balance:", error);
      throw error;
    }
  }

  /**
   * Get account nonce
   */
  async getNonce(address: string): Promise<number> {
    try {
      return await this.demosClient.getAddressNonce(address);
    } catch (error) {
      console.error("Failed to get nonce:", error);
      throw error;
    }
  }

  /**
   * Send transaction
   */
  async sendTransaction(tx: {
    to: string;
    value: string;
  }): Promise<DemosTransaction> {
    try {
      // Create and sign transaction
      const amount = parseFloat(tx.value);
      const transaction = await this.demosClient.transfer(tx.to, amount);

      // Confirm transaction
      const validityData = await this.demosClient.confirm(transaction);

      // Broadcast transaction
      const response = await this.demosClient.broadcast(validityData);

      const txResult: DemosTransaction = {
        hash: transaction.hash || "",
        from: transaction.sender || "",
        to: transaction.receiver || "",
        value: tx.value,
        nonce: transaction.nonce || 0,
      };

      console.log("✅ Transaction sent:", txResult.hash);
      return txResult;
    } catch (error) {
      console.error("Failed to send transaction:", error);
      throw error;
    }
  }

  /**
   * Get transaction by hash
   */
  async getTransactionReceipt(txHash: string): Promise<any> {
    try {
      return await this.demosClient.getTxByHash(txHash);
    } catch (error) {
      console.error("Failed to get transaction receipt:", error);
      throw error;
    }
  }

  /**
   * Get last block number
   */
  async getBlockNumber(): Promise<number> {
    try {
      return await this.demosClient.getLastBlockNumber();
    } catch (error) {
      console.error("Failed to get block number:", error);
      throw error;
    }
  }

  /**
   * Get block by number
   */
  async getBlock(blockNumber: number): Promise<any> {
    try {
      return await this.demosClient.getBlockByNumber(blockNumber);
    } catch (error) {
      console.error("Failed to get block:", error);
      throw error;
    }
  }

  /**
   * Get transaction history for address
   */
  async getTransactionHistory(address: string, limit: number = 100): Promise<any[]> {
    try {
      return await this.demosClient.getTransactionHistory(address, "all", { start: 0, limit });
    } catch (error) {
      console.error("Failed to get transaction history:", error);
      throw error;
    }
  }

  /**
   * Get network info
   */
  getNetworkInfo(): {
    network: string;
    rpcUrl: string;
    explorer: string;
    chainId: number;
  } {
    return {
      network: this.network,
      rpcUrl: this.rpcUrl,
      explorer: DEMOS_CONFIG.explorer,
      chainId: this.network === "mainnet" ? DEMOS_CONFIG.mainnetChainId : DEMOS_CONFIG.testnetChainId,
    };
  }

  /**
   * Get explorer URL for transaction
   */
  getExplorerUrl(txHash: string): string {
    return `${DEMOS_CONFIG.explorer}/tx/${txHash}`;
  }

  /**
   * Get explorer URL for address
   */
  getAddressExplorerUrl(address: string): string {
    return `${DEMOS_CONFIG.explorer}/address/${address}`;
  }
}

/**
 * Global instance for easy access
 */
let globalDemosConnector: DemosNodeConnector | null = null;

/**
 * Get or create Demos connector instance
 */
export function getDemosConnector(config?: DemosNodeConfig): DemosNodeConnector {
  if (!globalDemosConnector) {
    globalDemosConnector = new DemosNodeConnector(config);
  }
  return globalDemosConnector;
}

/**
 * Reset global connector (useful for switching networks)
 */
export function resetDemosConnector(): void {
  globalDemosConnector = null;
}

/**
 * Format DEMOS amount (from wei to DEMOS)
 */
export function formatDEMOS(wei: string | bigint): string {
  const value = typeof wei === "string" ? BigInt(wei) : wei;
  const demos = Number(value) / 1e18;
  return demos.toFixed(6);
}

/**
 * Parse DEMOS amount (from DEMOS to wei)
 */
export function parseDEMOS(demos: string): string {
  const value = parseFloat(demos) * 1e18;
  return BigInt(Math.floor(value)).toString();
}

/**
 * Validate Demos address
 */
export function isValidDemosAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
