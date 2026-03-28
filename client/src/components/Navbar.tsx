import { NavLink, Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const NAV_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Features", to: "/#features" },
  { label: "Docs", to: "/#docs" },
];

function AsteriskLogo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line
        x1="11"
        y1="1"
        x2="11"
        y2="21"
        stroke="#0a0a0a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="1"
        y1="11"
        x2="21"
        y2="11"
        stroke="#0a0a0a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="3.93"
        y1="3.93"
        x2="18.07"
        y2="18.07"
        stroke="#0a0a0a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="18.07"
        y1="3.93"
        x2="3.93"
        y2="18.07"
        stroke="#0a0a0a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Navbar() {
  return (
    <div className="pill-nav-wrapper">
      <nav className="pill-nav">
        {/* Logo */}
        <Link to="/" className="pill-nav-logo">
          <AsteriskLogo />
          DecCampaign
        </Link>

        {/* Nav links */}
        <ul className="pill-nav-links">
          {NAV_LINKS.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="pill-nav-actions">
          <Link to="/dashboard" className="pill-nav-cta">
            Launch App
          </Link>
          <ConnectButton
            accountStatus="avatar"
            chainStatus="none"
            showBalance={false}
          />
        </div>
      </nav>
    </div>
  );
}
