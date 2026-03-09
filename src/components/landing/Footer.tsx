import { Scissors } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Produto",
    links: [
      { label: "Funcionalidades", href: "#features" },
      { label: "Planos", href: "#pricing" },
      { label: "Demonstração", href: "/demo" },
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
    <footer className="border-t border-border bg-card py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 font-bold text-lg text-foreground mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Scissors className="h-4 w-4 text-primary-foreground" />
              </div>
              CutFlow
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              A plataforma completa para gestão de barbearias modernas.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-bold text-sm mb-4 text-foreground">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2026 CutFlow. Todos os direitos reservados.</p>
          <div className="flex gap-5">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">Instagram</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">LinkedIn</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
