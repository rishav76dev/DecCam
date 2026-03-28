import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CampaignFlowSection } from "@/components/hero/CampaignFlowSection";

const STACK_CARD_IDS = ["monad-front", "x-middle", "monad-back"] as const;

const STACK_CARD_ASSETS: Record<(typeof STACK_CARD_IDS)[number], { alt: string; src: string }> = {
  "monad-front": { alt: "Monad", src: "/monad.png" },
  "x-middle": { alt: "X", src: "/twitter.png" },
  "monad-back": { alt: "eth", src: "/ethereum.png" },
};

const STACK_ORDERS: Array<Array<(typeof STACK_CARD_IDS)[number]>> = [
  ["monad-front", "x-middle", "monad-back"],
  ["monad-back", "monad-front", "x-middle"],
  ["x-middle", "monad-back", "monad-front"],
];

function AppIcon() {
  const [stackStep, setStackStep] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStackStep((current) => (current + 1) % STACK_ORDERS.length);
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  const activeOrder = STACK_ORDERS[stackStep];

  return (
    <div className="hero-app-icon" aria-hidden="true">
      {STACK_CARD_IDS.map((cardId) => {
        const slot = activeOrder.indexOf(cardId);
        const asset = STACK_CARD_ASSETS[cardId];

        return (
          <div key={cardId} className={`hero-stack-card slot-${slot}`}>
            <img src={asset.src} alt={asset.alt} />
          </div>
        );
      })}
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="hero-center" aria-label="Hero">
      <AppIcon />

      <div className="text-6xl font-medium">
        Fund real-world Web3 campaigns.
      </div>

      <p className="hero-center-sub">
        Featuring transparent budget allocation, proportionasl creator rewards,
        and full on-chain accountability. New campaigns weekly.
      </p>

      <div className="hero-pill-btns">
        <Link to="/dashboard" className="btn-pill-black">
          Start a Campaign
        </Link>
        <Link to="/dashboard" className="btn-pill-outline">
          Browse Campaigns <ArrowRight size={16} />
        </Link>
      </div>

      <CampaignFlowSection />
    </section>
  );
}
