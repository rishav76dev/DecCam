import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function AppIcon() {
  return (
    <div className="hero-app-icon">
      <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg" width="88" height="88">
        {/* Dark gradient background */}
        <defs>
          <linearGradient id="icon-bg" x1="0" y1="0" x2="88" y2="88" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1a1a2e"/>
            <stop offset="100%" stopColor="#16213e"/>
          </linearGradient>
          <linearGradient id="icon-accent" x1="0" y1="88" x2="88" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#b8fe66"/>
            <stop offset="50%" stopColor="#4ade80"/>
            <stop offset="100%" stopColor="#b8fe66" stopOpacity="0.6"/>
          </linearGradient>
        </defs>
        <rect width="88" height="88" fill="url(#icon-bg)"/>
        {/* Megaphone / campaign icon */}
        <path d="M20 38 L20 50 L28 50 L44 62 L44 26 L28 38 Z" fill="url(#icon-accent)" opacity="0.9"/>
        <rect x="20" y="38" width="8" height="12" rx="1" fill="#b8fe66" opacity="0.5"/>
        {/* Sound waves */}
        <path d="M48 34 Q54 44 48 54" stroke="#b8fe66" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
        <path d="M52 30 Q62 44 52 58" stroke="#b8fe66" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
        {/* Dot accent */}
        <circle cx="64" cy="28" r="4" fill="#b8fe66" opacity="0.6"/>
      </svg>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="hero-center" aria-label="Hero">
      <AppIcon />

      <h1 className="hero-center-heading">
        Fund real-world Web3 campaigns.
      </h1>

      <p className="hero-center-sub">
        Featuring transparent budget allocation, proportional creator rewards,
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
    </section>
  );
}
