import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/hero/HeroSection";
import { TrustedBySection } from "@/components/hero/TrustedBySection";

export function Home() {
  return (
    <div className="home-page">
      <Navbar />
      <HeroSection />
      <TrustedBySection />
    </div>
  );
}
