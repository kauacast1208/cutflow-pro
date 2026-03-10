import { Scissors } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Produto",
    links: [
      { label: "Funcionalidades", href: "#features" },
      { label: "Planos", href: "#pricing" },
      { label: "Demonstracao", href: "/demo" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contato", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "#" },
      { label: "Privacidade", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 font-bold text-lg text-foreground mb-3 sm:mb-4">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
                <Scissors className="h-4 w-4 text-primary-foreground" />
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>CutFlow</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[220px]">
              A plataforma completa para gestao de barbearias modernas.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-bold text-xs sm:text-sm mb-3 sm:mb-4 text-foreground uppercase tracking-wider">{group.title}</h4>
              <ul className="space-y-2 sm:space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link to={link.href} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground">2026 CutFlow. Todos os direitos reservados.</p>
          <div className="flex gap-4 sm:gap-5">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">Instagram</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">LinkedIn</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
