"use client";
import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { injected } from "wagmi/connectors";

export const demosTestnet = defineChain({
  id: 123456,
  name: "Demos Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "DEMOS",
    symbol: "DEMOS",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.demos.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Demos Explorer",
      url: "https://explorer.demos.sh",
    },
  },
  testnet: true,
});

// Only Demos Wallet connector
const getConnectors = () => {
  const connectorsList = [];

  try {
    // Demos Wallet ONLY
    // Chrome Extension: https://chromewebstore.google.com/detail/demos-wallet/nefongcpmdahjaijjkihgieiamoahcoo
    connectorsList.push(
      injected({
        shimDisconnect: true,
      })
    );
  } catch (error) {
    console.warn("Failed to initialize Demos Wallet connector:", error);
  }

  return connectorsList;
};

export const config = createConfig({
  chains: [demosTestnet],
  connectors: getConnectors(),
  transports: {
    [demosTestnet.id]: http(),
  },
  ssr: false,
});
