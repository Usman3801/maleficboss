"use client";

/**
 * Demos Node Connector
 * Integrates with Demos Network using @kynesyslabs/demosdk
 */

import { Demos } from "@kynesyslabs/demosdk/websdk";
import { Wallet } from "ethers";

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
  gasLimit?: string;
  gasPrice?: string;
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

    console.log(`🌐 Connected to Demos ${this.network} at ${this.rpcUrl}`);
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
      // Derive wallet from mnemonic
      const wallet = Wallet.fromPhrase(mnemonic);

      // Connect wallet to Demos client
      await this.demosClient.connect(wallet);

      // Get account info
      const balance = await this.demosClient.getBalance(wallet.address);
      const nonce = await this.demosClient.getNonce(wallet.address);

      const account: DemosAccount = {
        address: wallet.address,
        publicKey: wallet.publicKey,
        balance: balance.toString(),
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
      const balance = await this.demosClient.getBalance(address);
      return balance.toString();
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
      return await this.demosClient.getNonce(address);
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
    data?: string;
  }): Promise<DemosTransaction> {
    try {
      const txResponse = await this.demosClient.sendTransaction({
        to: tx.to,
        value: tx.value,
        data: tx.data,
      });

      const transaction: DemosTransaction = {
        hash: txResponse.hash,
        from: txResponse.from,
        to: txResponse.to,
        value: txResponse.value.toString(),
        data: txResponse.data,
        nonce: txResponse.nonce,
        gasLimit: txResponse.gasLimit?.toString(),
        gasPrice: txResponse.gasPrice?.toString(),
      };

      console.log("✅ Transaction sent:", transaction.hash);
      return transaction;
    } catch (error) {
      console.error("Failed to send transaction:", error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string): Promise<any> {
    try {
      return await this.demosClient.getTransactionReceipt(txHash);
    } catch (error) {
      console.error("Failed to get transaction receipt:", error);
      throw error;
    }
  }

  /**
   * Get block number
   */
  async getBlockNumber(): Promise<number> {
    try {
      return await this.demosClient.getBlockNumber();
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
      return await this.demosClient.getBlock(blockNumber);
    } catch (error) {
      console.error("Failed to get block:", error);
      throw error;
    }
  }

  /**
   * Get gas price
   */
  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.demosClient.getGasPrice();
      return gasPrice.toString();
    } catch (error) {
      console.error("Failed to get gas price:", error);
      throw error;
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(tx: {
    to: string;
    value?: string;
    data?: string;
  }): Promise<string> {
    try {
      const gasEstimate = await this.demosClient.estimateGas(tx);
      return gasEstimate.toString();
    } catch (error) {
      console.error("Failed to estimate gas:", error);
      throw error;
    }
  }

  /**
   * Deploy contract
   */
  async deployContract(bytecode: string, abi: any[]): Promise<string> {
    try {
      const contractAddress = await this.demosClient.deployContract({
        bytecode,
        abi,
      });

      console.log("✅ Contract deployed at:", contractAddress);
      return contractAddress;
    } catch (error) {
      console.error("Failed to deploy contract:", error);
      throw error;
    }
  }

  /**
   * Call contract method
   */
  async callContract(
    contractAddress: string,
    abi: any[],
    method: string,
    args: any[]
  ): Promise<any> {
    try {
      return await this.demosClient.callContract({
        address: contractAddress,
        abi,
        method,
        args,
      });
    } catch (error) {
      console.error("Failed to call contract:", error);
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
