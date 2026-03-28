const PROTOCOLS = [
  "Uniswap",
  "Aave",
  "MakerDAO",
  "Compound",
  "Balancer",
  "Curve",
  "1inch",
];

export function TrustedBySection() {
  return (
    <div className="trusted-by">
      <p className="trusted-by-label">Trusted by teams at</p>
      <div className="trusted-by-logos">
        {PROTOCOLS.map((name) => (
          <span key={name} className="trusted-by-logo">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
