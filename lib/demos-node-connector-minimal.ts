"use client";

/**
 * Minimal Demos Node Connector
 * Direct RPC connection without heavy DemoSDK dependencies
 */

import { JsonRpcProvider, Wallet, HDNodeWallet, parseEther, formatEther } from "ethers";

// Demos Network Configuration
const DEMOS_CONFIG = {
  mainnet: {
    rpcUrl: "https://rpc.demos.network",
    chainId: 1234567,
  },
  testnet: {
    rpcUrl: "https://testnet-rpc.demos.network",
    chainId: 123456,
  },
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
 * Minimal Demos Node Connector using ethers.js directly
 */
export class DemosNodeConnector {
  private provider: JsonRpcProvider;
  private network: "mainnet" | "testnet";
  private wallet: HDNodeWallet | null = null;

  constructor(config: DemosNodeConfig = {}) {
    this.network = config.network || "testnet";
    const networkConfig = DEMOS_CONFIG[this.network];
    const rpcUrl = config.rpcUrl || networkConfig.rpcUrl;

    this.provider = new JsonRpcProvider(rpcUrl, {
      chainId: networkConfig.chainId,
      name: `demos-${this.network}`,
    });

    console.log(`🌐 Connected to Demos ${this.network} at ${rpcUrl}`);
  }

  /**
   * Connect wallet with mnemonic
   */
  async connectWallet(mnemonic: string): Promise<DemosAccount> {
    try {
      this.wallet = Wallet.fromPhrase(mnemonic).connect(this.provider);

      const [balance, nonce] = await Promise.all([
        this.provider.getBalance(this.wallet.address),
        this.provider.getTransactionCount(this.wallet.address),
      ]);

      const account: DemosAccount = {
        address: this.wallet.address,
        publicKey: this.wallet.publicKey,
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
      const balance = await this.provider.getBalance(address);
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
      return await this.provider.getTransactionCount(address);
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
    if (!this.wallet) {
      throw new Error("Wallet not connected");
    }

    try {
      const txResponse = await this.wallet.sendTransaction({
        to: tx.to,
        value: tx.value,
        data: tx.data,
      });

      await txResponse.wait();

      const transaction: DemosTransaction = {
        hash: txResponse.hash,
        from: txResponse.from,
        to: txResponse.to!,
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
      return await this.provider.getTransactionReceipt(txHash);
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
      return await this.provider.getBlockNumber();
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
      return await this.provider.getBlock(blockNumber);
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
      const feeData = await this.provider.getFeeData();
      return (feeData.gasPrice || 0n).toString();
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
      const gasEstimate = await this.provider.estimateGas({
        to: tx.to,
        value: tx.value || "0",
        data: tx.data,
      });
      return gasEstimate.toString();
    } catch (error) {
      console.error("Failed to estimate gas:", error);
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
    const config = DEMOS_CONFIG[this.network];
    return {
      network: this.network,
      rpcUrl: config.rpcUrl,
      explorer: DEMOS_CONFIG.explorer,
      chainId: config.chainId,
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
  if (!globalDemosConnector || config) {
    globalDemosConnector = new DemosNodeConnector(config);
  }
  return globalDemosConnector;
}

/**
 * Reset global connector
 */
export function resetDemosConnector(): void {
  globalDemosConnector = null;
}

/**
 * Format DEMOS amount (from wei to DEMOS)
 */
export function formatDEMOS(wei: string | bigint): string {
  return formatEther(wei);
}

/**
 * Parse DEMOS amount (from DEMOS to wei)
 */
export function parseDEMOS(demos: string): string {
  return parseEther(demos).toString();
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
