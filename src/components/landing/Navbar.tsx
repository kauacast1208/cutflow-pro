import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X, Scissors } from "lucide-react";

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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "glass shadow-sm" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto flex h-16 sm:h-[68px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-foreground">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Scissors className="h-4 w-4 text-primary-foreground" />
          </div>
          CutFlow
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) =>
            (l as any).isRoute ? (
              <Link key={l.href} to={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="font-medium">Entrar</Button>
          </Link>
          <Link to="/signup">
            <Button variant="default" size="sm" className="font-semibold shadow-sm">Teste grátis</Button>
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-foreground">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl px-4 pb-5 pt-3">
          {links.map((l) =>
            (l as any).isRoute ? (
              <Link key={l.href} to={l.href} className="block py-2.5 text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className="block py-2.5 text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            )
          )}
          <div className="mt-4 flex gap-2">
            <Link to="/login" className="flex-1">
              <Button variant="outline" size="sm" className="w-full h-11">Entrar</Button>
            </Link>
            <Link to="/signup" className="flex-1">
              <Button variant="default" size="sm" className="w-full h-11">Teste grátis</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
