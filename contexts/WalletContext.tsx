"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getStoredWalletAddress } from "@/lib/wallet-generator";
// import { getDemosAddress, isDemosWalletConnected, disconnectDemosWallet } from "@/lib/demos-sdk";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  demosAddress: string | null;
  demosConnected: boolean;
  setWalletConnected: (address: string, demosAddr?: string) => void;
  setWalletDisconnected: () => void;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  demosAddress: null,
  demosConnected: false,
  setWalletConnected: () => {},
  setWalletDisconnected: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [demosAddress, setDemosAddress] = useState<string | null>(null);
  const [demosConnected, setDemosConnected] = useState(false);

  // Check for stored wallet on mount
  useEffect(() => {
    const storedAddress = getStoredWalletAddress();
    if (storedAddress) {
      setAddress(storedAddress);
      setIsConnected(true);

      // Check if Demos wallet is also connected
      // TODO: Re-enable when Demos SDK browser compatibility is fixed
      // const demosAddr = getDemosAddress();
      // if (demosAddr) {
      //   setDemosAddress(demosAddr);
      //   setDemosConnected(isDemosWalletConnected());
      // }
    }
  }, []);

  const setWalletConnected = (walletAddress: string, demosAddr?: string) => {
    setAddress(walletAddress);
    setIsConnected(true);

    if (demosAddr) {
      setDemosAddress(demosAddr);
      setDemosConnected(true);
    }
  };

  const setWalletDisconnected = () => {
    setAddress(null);
    setIsConnected(false);
    setDemosAddress(null);
    setDemosConnected(false);
    // disconnectDemosWallet(); // TODO: Re-enable when Demos SDK browser compatibility is fixed
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        demosAddress,
        demosConnected,
        setWalletConnected,
        setWalletDisconnected,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
