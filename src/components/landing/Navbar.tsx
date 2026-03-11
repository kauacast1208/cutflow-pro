import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X, Scissors, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Funcionalidades", href: "#features" },
  { label: "Como funciona", href: "#how-it-works" },
  { label: "Planos", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Agendamento", href: "/demo", isRoute: true },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "glass shadow-sm" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto flex h-16 sm:h-[68px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-foreground">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Scissors className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>CutFlow</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 lg:gap-8">
          {links.map((l) =>
            (l as any).isRoute ? (
              <Link key={l.href} to={l.href} className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="font-medium text-[13px]">Entrar</Button>
          </Link>
          <Link to="/signup">
            <Button variant="default" size="sm" className="font-semibold shadow-sm rounded-xl px-5">
              Teste gratis
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-3 -mr-3 text-foreground rounded-xl hover:bg-accent/50 transition-colors">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-card/98 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-5 pb-6 pt-4">
              <nav className="space-y-1 mb-5">
                {links.map((l) =>
                  (l as any).isRoute ? (
                    <Link key={l.href} to={l.href} className="block py-3 px-3 text-[15px] font-medium text-foreground rounded-xl hover:bg-accent/50 transition-colors" onClick={() => setOpen(false)}>
                      {l.label}
                    </Link>
                  ) : (
                    <a key={l.href} href={l.href} className="block py-3 px-3 text-[15px] font-medium text-foreground rounded-xl hover:bg-accent/50 transition-colors" onClick={() => setOpen(false)}>
                      {l.label}
                    </a>
                  )
                )}
              </nav>
              <div className="space-y-2.5">
                <Link to="/signup" className="block" onClick={() => setOpen(false)}>
                  <Button variant="default" className="w-full h-12 rounded-xl text-base font-semibold">
                    Teste gratis
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
                <Link to="/login" className="block" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full h-12 rounded-xl text-base font-medium">Entrar</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
