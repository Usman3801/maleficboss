"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DemosNodeConnector,
  getDemosConnector,
  DemosAccount,
  DemosTransaction,
  formatDEMOS,
  parseDEMOS,
} from "@/lib/demos-node-connector-minimal";
import { useWallet } from "@/contexts/WalletContext";

export interface UseDemosNodeReturn {
  connector: DemosNodeConnector | null;
  account: DemosAccount | null;
  balance: string;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Methods
  connect: (mnemonic: string) => Promise<void>;
  disconnect: () => void;
  sendTransaction: (to: string, value: string, data?: string) => Promise<DemosTransaction>;
  getBalance: (address: string) => Promise<string>;
  refreshBalance: () => Promise<void>;
  getBlockNumber: () => Promise<number>;
  getGasPrice: () => Promise<string>;
}

/**
 * React hook for Demos Node integration
 */
export function useDemosNode(network: "mainnet" | "testnet" = "testnet"): UseDemosNodeReturn {
  const { address } = useWallet();
  const [connector, setConnector] = useState<DemosNodeConnector | null>(null);
  const [account, setAccount] = useState<DemosAccount | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize connector
  useEffect(() => {
    try {
      const demosConnector = getDemosConnector({ network });
      setConnector(demosConnector);
      console.log("✅ Demos node connector initialized");
    } catch (err: any) {
      console.error("Failed to initialize Demos connector:", err);
      setError(err.message);
    }
  }, [network]);

  // Connect to Demos node
  const connect = useCallback(async (mnemonic: string) => {
    if (!connector) {
      setError("Connector not initialized");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const demosAccount = await connector.connectWallet(mnemonic);
      setAccount(demosAccount);
      setBalance(formatDEMOS(demosAccount.balance));
      console.log("✅ Connected to Demos node:", demosAccount.address);
    } catch (err: any) {
      console.error("Failed to connect to Demos node:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [connector]);

  // Disconnect
  const disconnect = useCallback(() => {
    setAccount(null);
    setBalance("0");
    setError(null);
    console.log("Disconnected from Demos node");
  }, []);

  // Send transaction
  const sendTransaction = useCallback(async (
    to: string,
    value: string,
    data?: string
  ): Promise<DemosTransaction> => {
    if (!connector) {
      throw new Error("Connector not initialized");
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await connector.sendTransaction({
        to,
        value: parseDEMOS(value),
        data,
      });

      // Refresh balance after transaction
      await refreshBalance();

      return tx;
    } catch (err: any) {
      console.error("Transaction failed:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [connector]);

  // Get balance
  const getBalance = useCallback(async (addr: string): Promise<string> => {
    if (!connector) {
      throw new Error("Connector not initialized");
    }

    try {
      const bal = await connector.getBalance(addr);
      return formatDEMOS(bal);
    } catch (err: any) {
      console.error("Failed to get balance:", err);
      throw err;
    }
  }, [connector]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!connector || !account) {
      return;
    }

    try {
      const bal = await connector.getBalance(account.address);
      setBalance(formatDEMOS(bal));
    } catch (err: any) {
      console.error("Failed to refresh balance:", err);
    }
  }, [connector, account]);

  // Get block number
  const getBlockNumber = useCallback(async (): Promise<number> => {
    if (!connector) {
      throw new Error("Connector not initialized");
    }

    return await connector.getBlockNumber();
  }, [connector]);

  // Get gas price
  const getGasPrice = useCallback(async (): Promise<string> => {
    if (!connector) {
      throw new Error("Connector not initialized");
    }

    return await connector.getGasPrice();
  }, [connector]);

  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    if (account && connector) {
      const interval = setInterval(() => {
        refreshBalance();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [account, connector, refreshBalance]);

  return {
    connector,
    account,
    balance,
    isConnected: !!account,
    isLoading,
    error,

    connect,
    disconnect,
    sendTransaction,
    getBalance,
    refreshBalance,
    getBlockNumber,
    getGasPrice,
  };
}
