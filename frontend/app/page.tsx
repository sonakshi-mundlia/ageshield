import HomeNavbar from "@/components/home/HomeNavbar";
import HeroSection from "@/components/home/HeroSection";
import WhatIsAgeShield from "@/components/home/WhatIsAgeshield";
import WhyAgeShield from "@/components/home/WhyAgeshield";
import HowItWorks from "@/components/home/HowItWorks";
import SecurityDecisions from "@/components/home/SecurityDecisions";
import Features from "@/components/home/Features";
import HomeCTA from "@/components/home/HomeCTA";

export default function HomePage() {
  return (
    <>
      <HomeNavbar />
      <main>
        <HeroSection />
        <WhatIsAgeShield />
        <WhyAgeShield />
        <HowItWorks />
        <SecurityDecisions />
        <Features />
        <HomeCTA />
      </main>
    </>
  );
}