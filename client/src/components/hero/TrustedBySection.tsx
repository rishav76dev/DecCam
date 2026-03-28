import { useEffect, useRef, useState } from "react";

const FEATURE_IMAGES = [
  { alt: "Landing showcase primary", src: "/image.png" },
  { alt: "Landing showcase secondary", src: "/image1.png" },
] as const;

const STORY_LINES = [
  "Campaign budgets are escrowed on-chain before creator work begins.",
  "Creators submit X posts and real views are synced from worker verification.",
  "Rewards are split proportionally and claimed directly from each wallet.",
];

const BACKGROUND_LOGOS = [
  { alt: "Monad", src: "/monad.png" },
  { alt: "Phantom", src: "PHANTOM.png" },
  { alt: "Ethereum", src: "/ethereum.png" },
  { alt: "MetaMask", src: "METAMASK.png" },
  { alt: "Instagram", src: "instagram.png" },
] as const;

function FooterLogo() {
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
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="1"
        y1="11"
        x2="21"
        y2="11"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="3.93"
        y1="3.93"
        x2="18.07"
        y2="18.07"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="18.07"
        y1="3.93"
        x2="3.93"
        y2="18.07"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TrustedBySection() {
  const [activeImage, setActiveImage] = useState(0);
  const [activeStoryLine, setActiveStoryLine] = useState(0);
  const storySectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveImage((prev) => (prev + 1) % FEATURE_IMAGES.length);
    }, 2800);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const section = storySectionRef.current;
      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0) {
        setActiveStoryLine(0);
        return;
      }

      const traveled = Math.min(Math.max(-rect.top, 0), total);
      const progress = traveled / total;

      if (progress < 1 / 3) {
        setActiveStoryLine(0);
      } else if (progress < 2 / 3) {
        setActiveStoryLine(1);
      } else {
        setActiveStoryLine(2);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <section className="landing-showcase" aria-label="Featured landing showcase">
        <header className="landing-showcase-head">
          <p>Featured work</p>
          <div className="text-5xl font-medium font-['Open_Sans]">From inspiration to real campaign creation</div>
        </header>

        <div className="landing-board-shell" aria-live="polite">
          <div className="landing-board board-a is-active">
            <div className="landing-board-topbar">
              <span>Apps</span>
              <span>Flows</span>
              <span>Collections</span>
            </div>

            <div className="landing-image-fade-stage" aria-label="Featured image preview">
              {FEATURE_IMAGES.map((image, index) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  className={`landing-fade-image${activeImage === index ? " is-active" : ""}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        ref={storySectionRef}
        className="landing-scroll-story"
        aria-label="Scroll storytelling section"
      >
        <div className="landing-scroll-sticky">
          <div className="landing-static-background" aria-hidden="true" />

          <div className="landing-bg-logo-cloud" aria-hidden="true">
            {BACKGROUND_LOGOS.map((logo, index) => (
              <span key={logo.alt} className={`landing-bg-logo logo-${index + 1}`}>
                <img src={logo.src} alt="" />
              </span>
            ))}
          </div>

          <div className="landing-story-copy">
            {STORY_LINES.map((line, index) => (
              <p
                key={line}
                className={`landing-story-line${activeStoryLine === index ? " is-active" : ""}`}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer" aria-label="Footer">
        <div className="landing-footer-brand">
          <span className="landing-footer-mark" aria-hidden="true">
            <FooterLogo />
          </span>
          <p>Design better campaign experiences with DecCampaign.</p>
        </div>

        <div className="landing-footer-links">
          <ul>
            <li>Explore</li>
            <li>Pricing</li>
            <li>Changelog</li>
            <li>Colors</li>
          </ul>

          <ul>
            <li>Contact</li>
            <li>Help center</li>
            <li>Careers</li>
            <li>LinkedIn</li>
          </ul>
        </div>

        <div className="landing-footer-bottom">
          <p>© DecCampaign 2026. All rights reserved</p>
          <div>
            <a href="/">Privacy policy</a>
            <a href="/">Terms</a>
          </div>
        </div>
      </footer>
    </>
  );
}
