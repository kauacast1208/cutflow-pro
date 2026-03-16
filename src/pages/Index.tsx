import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { PainPointsSection } from "@/components/landing/PainPointsSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { DemoSection } from "@/components/landing/DemoSection";
import { WhatsAppFeatureSection } from "@/components/landing/WhatsAppFeatureSection";
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
      {/* 1. Hero — Pain driven */}
      <HeroSection />
      {/* 2. Problem — Financial impact */}
      <PainPointsSection />
      {/* 3. Solution — Features overview */}
      <SolutionSection />
      <ComparisonSection />
      {/* 4. How it works */}
      <HowItWorksSection />
      {/* 5. MacBook + iPhone showcase */}
      <DemoSection />
      {/* 6. Features deep dive */}
      <div id="features"><FeaturesSection /></div>
      <WhatsAppFeatureSection />
      <GoogleCalendarSection />
      <BrandingSection />
      {/* 7. Results — Metrics */}
      <ResultsSection />
      {/* 8. Social proof */}
      <TestimonialsSection />
      <AmbassadorSection />
      <AboutSection />
      {/* 9. Pricing */}
      <div id="pricing"><PricingSection /></div>
      {/* 10. FAQ + Final CTA */}
      <div id="faq"><FAQSection /></div>
      <FinalCTASection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
