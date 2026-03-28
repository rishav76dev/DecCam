import React from "react";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./wagmiConfig";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

const decCampaignTheme = lightTheme({
  accentColor: "#0a0a0a", // black buttons (Connect Wallet, etc.)
  accentColorForeground: "#ffffff", // white text on black buttons
  borderRadius: "large",
  fontStack: "system",
  overlayBlur: "small",
});

/* Override specific tokens to inject the lime-green brand accent */
const customTheme = {
  ...decCampaignTheme,
  colors: {
    ...decCampaignTheme.colors,
    /* Modal header / selected ring highlight */
    accentColor: "#0a0a0a",
    accentColorForeground: "#ffffff",
    /* Wallet option hover tint */
    actionButtonBorder: "#e4e4e7",
    actionButtonBorderMobile: "#e4e4e7",
    actionButtonSecondaryBackground: "#f4f4f5",
    /* Connected account button */
    connectButtonBackground: "#0a0a0a",
    connectButtonBackgroundError: "#ef4444",
    connectButtonInnerBackground: "#1a1a1a",
    connectButtonText: "#ffffff",
    connectButtonTextError: "#ffffff",
    /* Misc surfaces */
    connectionIndicator: "#b8fe66", // lime dot when connected
    downloadBottomCardBackground: "#ffffff",
    downloadTopCardBackground: "#f4f4f5",
    error: "#ef4444",
    generalBorder: "#e4e4e7",
    generalBorderDim: "#f4f4f5",
    menuItemBackground: "#f4f4f5",
    modalBackdrop: "rgba(10, 10, 10, 0.4)",
    modalBackground: "#ffffff",
    modalBorder: "#e4e4e7",
    modalText: "#0a0a0a",
    modalTextDim: "#6b7280",
    modalTextSecondary: "#6b7280",
    profileAction: "#f4f4f5",
    profileActionHover: "#e4e4e7",
    profileForeground: "#fafafa",
    selectedOptionBorder: "#b8fe66", // lime highlight on selected wallet
    standby: "#b8fe66",
  },
  radii: {
    ...decCampaignTheme.radii,
    actionButton: "10px",
    connectButton: "10px",
    menuButton: "10px",
    modal: "20px",
    modalMobile: "20px",
  },
  shadows: {
    connectButton: "0 2px 8px rgba(10, 10, 10, 0.12)",
    dialog: "0 20px 40px rgba(10, 10, 10, 0.15)",
    profileDetailsAction: "0 2px 6px rgba(10, 10, 10, 0.08)",
    selectedOption: "0 0 0 3px rgba(184, 254, 102, 0.5)",
    selectedWallet: "0 0 0 3px rgba(184, 254, 102, 0.5)",
    walletLogo: "0 2px 6px rgba(10, 10, 10, 0.08)",
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
