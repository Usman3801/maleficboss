import { useState, useEffect, useCallback } from "react";
import {
  isDemosWalletInstalled,
  requestDemosWalletAccounts,
  getDemosWalletAccounts,
  getDemosWalletChainId,
  switchToDemosTestnet,
  onAccountsChanged,
  onChainChanged,
  onDisconnect,
  getDemosBalance,
} from "@/lib/demos-wallet";

export function useDemosWallet() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is installed
  useEffect(() => {
    const installed = isDemosWalletInstalled();
    setIsInstalled(installed);

    if (installed) {
      // Check if already connected
      getDemosWalletAccounts().then((accs) => {
        if (accs.length > 0) {
          setAccounts(accs);
          setCurrentAccount(accs[0]);
          setIsConnected(true);
        }
      });

      // Get chain ID
      getDemosWalletChainId()
        .then(setChainId)
        .catch(console.error);
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!isInstalled) return;

    const cleanup = onAccountsChanged((accs) => {
      setAccounts(accs);
      setCurrentAccount(accs.length > 0 ? accs[0] : null);
      setIsConnected(accs.length > 0);
    });

    return cleanup;
  }, [isInstalled]);

  // Listen for chain changes
  useEffect(() => {
    if (!isInstalled) return;

    const cleanup = onChainChanged((newChainId) => {
      setChainId(newChainId);
    });

    return cleanup;
  }, [isInstalled]);

  // Listen for disconnect
  useEffect(() => {
    if (!isInstalled) return;

    const cleanup = onDisconnect(() => {
      setAccounts([]);
      setCurrentAccount(null);
      setIsConnected(false);
      setBalance("0");
    });

    return cleanup;
  }, [isInstalled]);

  // Fetch balance when account changes
  useEffect(() => {
    if (currentAccount) {
      getDemosBalance(currentAccount)
        .then(setBalance)
        .catch(console.error);
    } else {
      setBalance("0");
    }
  }, [currentAccount]);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!isInstalled) {
      setError("Demos Wallet is not installed");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const accs = await requestDemosWalletAccounts();
      setAccounts(accs);
      setCurrentAccount(accs[0]);
      setIsConnected(true);

      // Ensure we're on Demos Testnet
      await switchToDemosTestnet();
    } catch (err: any) {
      console.error("Failed to connect:", err);
      setError(err.message || "Failed to connect to Demos Wallet");
    } finally {
      setIsLoading(false);
    }
  }, [isInstalled]);

  // Disconnect (note: this just clears local state, actual disconnect is handled by wallet)
  const disconnect = useCallback(() => {
    setAccounts([]);
    setCurrentAccount(null);
    setIsConnected(false);
    setBalance("0");
  }, []);

  // Switch to Demos Testnet
  const switchToTestnet = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await switchToDemosTestnet();
      const newChainId = await getDemosWalletChainId();
      setChainId(newChainId);
    } catch (err: any) {
      console.error("Failed to switch network:", err);
      setError(err.message || "Failed to switch to Demos Testnet");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isInstalled,
    isConnected,
    accounts,
    currentAccount,
    chainId,
    balance,
    isLoading,
    error,

    // Actions
    connect,
    disconnect,
    switchToTestnet,
  };
}
