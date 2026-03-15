import { FAQSection } from "@/components/landing/FAQSection";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
