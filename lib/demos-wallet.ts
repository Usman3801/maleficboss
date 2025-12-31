/**
 * Demos Wallet Integration
 * Based on @kynesyslabs/demosdk documentation
 */

// Check if Demos Wallet is installed
export function isDemosWalletInstalled(): boolean {
  if (typeof window === "undefined") return false;

  // Check for window.ethereum (injected by Demos Wallet)
  return typeof window.ethereum !== "undefined";
}

// Get Demos Wallet provider
export function getDemosWalletProvider() {
  if (typeof window === "undefined") return null;

  // Demos Wallet injects itself as window.ethereum
  return window.ethereum;
}

// Request account connection
export async function requestDemosWalletAccounts(): Promise<string[]> {
  const provider = getDemosWalletProvider();

  if (!provider) {
    throw new Error("Demos Wallet is not installed");
  }

  try {
    // Request accounts using standard Ethereum provider API
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });

    return accounts;
  } catch (error: any) {
    console.error("Failed to connect to Demos Wallet:", error);
    throw new Error(error.message || "Failed to connect to Demos Wallet");
  }
}

// Get current connected accounts
export async function getDemosWalletAccounts(): Promise<string[]> {
  const provider = getDemosWalletProvider();

  if (!provider) {
    return [];
  }

  try {
    const accounts = await provider.request({
      method: "eth_accounts",
    });

    return accounts;
  } catch (error) {
    console.error("Failed to get accounts:", error);
    return [];
  }
}

// Get current chain ID
export async function getDemosWalletChainId(): Promise<string> {
  const provider = getDemosWalletProvider();

  if (!provider) {
    throw new Error("Demos Wallet is not installed");
  }

  try {
    const chainId = await provider.request({
      method: "eth_chainId",
    });

    return chainId;
  } catch (error) {
    console.error("Failed to get chain ID:", error);
    throw error;
  }
}

// Switch to Demos Testnet
export async function switchToDemosTestnet(): Promise<void> {
  const provider = getDemosWalletProvider();

  if (!provider) {
    throw new Error("Demos Wallet is not installed");
  }

  const DEMOS_TESTNET_CHAIN_ID = "0x1E240"; // 123456 in hex

  try {
    // Try to switch to Demos Testnet
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: DEMOS_TESTNET_CHAIN_ID }],
    });
  } catch (switchError: any) {
    // If chain doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: DEMOS_TESTNET_CHAIN_ID,
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
      } catch (addError) {
        console.error("Failed to add Demos Testnet:", addError);
        throw addError;
      }
    } else {
      throw switchError;
    }
  }
}

// Listen for account changes
export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
  const provider = getDemosWalletProvider();

  if (!provider || !provider.on) {
    return () => {};
  }

  provider.on("accountsChanged", callback);

  // Return cleanup function
  return () => {
    if (provider.removeListener) {
      provider.removeListener("accountsChanged", callback);
    }
  };
}

// Listen for chain changes
export function onChainChanged(callback: (chainId: string) => void): () => void {
  const provider = getDemosWalletProvider();

  if (!provider || !provider.on) {
    return () => {};
  }

  provider.on("chainChanged", callback);

  // Return cleanup function
  return () => {
    if (provider.removeListener) {
      provider.removeListener("chainChanged", callback);
    }
  };
}

// Listen for disconnection
export function onDisconnect(callback: () => void): () => void {
  const provider = getDemosWalletProvider();

  if (!provider || !provider.on) {
    return () => {};
  }

  provider.on("disconnect", callback);

  // Return cleanup function
  return () => {
    if (provider.removeListener) {
      provider.removeListener("disconnect", callback);
    }
  };
}

// Get balance
export async function getDemosBalance(address: string): Promise<string> {
  const provider = getDemosWalletProvider();

  if (!provider) {
    throw new Error("Demos Wallet is not installed");
  }

  try {
    const balance = await provider.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    });

    return balance;
  } catch (error) {
    console.error("Failed to get balance:", error);
    throw error;
  }
}

// Send transaction
export async function sendDemosTransaction(params: {
  from: string;
  to: string;
  value?: string;
  data?: string;
  gas?: string;
}): Promise<string> {
  const provider = getDemosWalletProvider();

  if (!provider) {
    throw new Error("Demos Wallet is not installed");
  }

  try {
    const txHash = await provider.request({
      method: "eth_sendTransaction",
      params: [params],
    });

    return txHash;
  } catch (error) {
    console.error("Failed to send transaction:", error);
    throw error;
  }
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
