import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { PainPointsSection } from "@/components/landing/PainPointsSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { WhatsAppFeatureSection } from "@/components/landing/WhatsAppFeatureSection";
import { DemoSection } from "@/components/landing/DemoSection";
import { LiveDemoSection } from "@/components/landing/LiveDemoSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { FloatingNotifications } from "@/components/landing/FloatingNotifications";
import WhatsAppButton from "@/components/booking/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <PainPointsSection />
      <ComparisonSection />
      <div id="features"><FeaturesSection /></div>
      <HowItWorksSection />
      <WhatsAppFeatureSection />
      <LiveDemoSection />
      <DemoSection />
      <SocialProofSection />
      <TestimonialsSection />
      <AboutSection />
      <div id="pricing"><PricingSection /></div>
      <div id="faq"><FAQSection /></div>
      <CTASection />
      <Footer />
      <FloatingNotifications />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
