import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { fallback, http } from "wagmi";
import { appChain, rpcUrls } from "@/lib/campaigns";

export const wagmiConfig = getDefaultConfig({
  appName: "Decentralized Campaign",
  projectId:
    import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "YOUR_PROJECT_ID",
  chains: [appChain],
  transports: {
    [appChain.id]: fallback(rpcUrls.map((url) => http(url, { timeout: 10_000 }))),
  },
  ssr: false,
});
