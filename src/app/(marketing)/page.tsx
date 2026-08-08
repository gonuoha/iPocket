import { HomepageAiSection } from "@/components/marketing/homepage-ai-section";
import { HomepageCta } from "@/components/marketing/homepage-cta";
import { HomepageFeatures } from "@/components/marketing/homepage-features";
import { HomepageFooter } from "@/components/marketing/homepage-footer";
import { HomepageHero } from "@/components/marketing/homepage-hero";
import { HomepageNavbar } from "@/components/marketing/homepage-navbar";
import { HomepageNavbarActions } from "@/components/marketing/homepage-navbar-actions";
import { HomepagePricing } from "@/components/marketing/homepage-pricing";
import { HomepageSocialProof } from "@/components/marketing/homepage-social-proof";

export default function HomePage() {
  return (
    <>
      <HomepageNavbar actions={<HomepageNavbarActions />} />
      <main>
        <HomepageHero />
        <HomepageFeatures />
        <HomepageSocialProof />
        <HomepageAiSection />
        <HomepagePricing />
        <HomepageCta />
      </main>
      <HomepageFooter />
    </>
  );
}
