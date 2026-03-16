import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { PainPointsSection } from "@/components/landing/PainPointsSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { WhatsAppFeatureSection } from "@/components/landing/WhatsAppFeatureSection";
import { DemoSection } from "@/components/landing/DemoSection";
import { GoogleCalendarSection } from "@/components/landing/GoogleCalendarSection";
import { BrandingSection } from "@/components/landing/BrandingSection";
import { ResultsSection } from "@/components/landing/ResultsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { AmbassadorSection } from "@/components/landing/AmbassadorSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { Footer } from "@/components/landing/Footer";
import WhatsAppButton from "@/components/booking/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <PainPointsSection />
      <SolutionSection />
      <ComparisonSection />
      <div id="features"><FeaturesSection /></div>
      <HowItWorksSection />
      <WhatsAppFeatureSection />
      <DemoSection />
      <GoogleCalendarSection />
      <BrandingSection />
      <ResultsSection />
      <TestimonialsSection />
      <AmbassadorSection />
      <AboutSection />
      <div id="pricing"><PricingSection /></div>
      <div id="faq"><FAQSection /></div>
      <FinalCTASection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
