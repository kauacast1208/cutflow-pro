import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { PainPointsSection } from "@/components/landing/PainPointsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { DemoSection } from "@/components/landing/DemoSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import WhatsAppButton from "@/components/booking/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <PainPointsSection />
      <div id="features"><FeaturesSection /></div>
      <div id="how-it-works"><HowItWorksSection /></div>
      <DemoSection />
      <TestimonialsSection />
      <div id="pricing"><PricingSection /></div>
      <div id="faq"><FAQSection /></div>
      <CTASection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
