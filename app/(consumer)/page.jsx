// Staging path for the consumer landing page. Once approved, this
// becomes app/page.js (replacing the current "/" -> "/rider" redirect)
// and this file/folder goes away.
import Header from "@/components/consumer/Header";
import Hero from "@/components/consumer/Hero";
import HowItWorks from "@/components/consumer/HowItWorks";
import PricingPreview from "@/components/consumer/PricingPreview";
import TrustSignals from "@/components/consumer/TrustSignals";
import CtaFooter from "@/components/consumer/CtaFooter";

export default function ConsumerLandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <PricingPreview />
        <TrustSignals />
      </main>
      <CtaFooter />
    </>
  );
}
