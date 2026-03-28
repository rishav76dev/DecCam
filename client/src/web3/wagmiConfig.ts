import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hardhat, mainnet, sepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Decentralized Campaign",
  projectId: "YOUR_PROJECT_ID", // Get one at https://cloud.walletconnect.com/
  chains: [hardhat, mainnet, sepolia],
  ssr: false, // Vite React is usually SPA
});
