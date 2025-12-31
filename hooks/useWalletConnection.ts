"use client";
import { useState, useEffect } from "react";

export interface WalletConnection {
  isConnected: boolean;
  address: string | null;
}

export function useWalletConnection(): WalletConnection {
  const [connection, setConnection] = useState<WalletConnection>({
    isConnected: false,
    address: null,
  });

  useEffect(() => {
    // Check localStorage for wallet connection
    const checkConnection = () => {
      if (typeof window === "undefined") return;

      const address = localStorage.getItem("demos_wallet_address");
      const isConnected = localStorage.getItem("demos_wallet_connected") === "true";

      setConnection({
        isConnected: isConnected && !!address,
        address: address,
      });
    };

    // Check on mount
    checkConnection();

    // Listen for storage changes (when wallet connects/disconnects)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "demos_wallet_address" || e.key === "demos_wallet_connected") {
        checkConnection();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom event from our wallet modal
    const handleWalletChange = () => {
      checkConnection();
    };

    window.addEventListener("wallet-connected", handleWalletChange);
    window.addEventListener("wallet-disconnected", handleWalletChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("wallet-connected", handleWalletChange);
      window.removeEventListener("wallet-disconnected", handleWalletChange);
    };
  }, []);

  return connection;
}
