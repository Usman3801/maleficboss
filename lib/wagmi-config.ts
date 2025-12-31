import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { injected, walletConnect } from "wagmi/connectors";

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
      http: [process.env.NEXT_PUBLIC_DEMOS_NETWORK_RPC || "https://testnet-rpc.demos.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Demos Explorer",
      url: "https://explorer.demos.network",
    },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [demosTestnet],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
      showQrModal: true,
    }),
  ],
  transports: {
    [demosTestnet.id]: http(),
  },
  ssr: false,
});
