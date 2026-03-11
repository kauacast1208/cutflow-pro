import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Scissors, ArrowRight, Play, Calendar, Users, BarChart3, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function DemoPage() {
  const [demoSlug, setDemoSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to find any barbershop to use as demo
    supabase
      .from("barbershops")
      .select("slug")
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setDemoSlug(data[0].slug);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Scissors className="h-4 w-4 text-primary-foreground" />
            </div>
            CutFlow
          </Link>
          <Link to="/signup">
            <Button size="sm">Começar teste gratuito</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-sm text-accent-foreground mb-6">
          <Play className="h-3.5 w-3.5" />
          Demonstração do CutFlow
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Veja o CutFlow em ação
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
          Explore todas as funcionalidades que vão transformar a gestão da sua barbearia.
        </p>

        {/* Demo screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-12">
          {[
            { icon: Calendar, title: "Agenda Inteligente", desc: "Visualize a semana inteira, arraste e solte horários, bloqueie intervalos." },
            { icon: Users, title: "Gestão de Clientes", desc: "Cadastro completo com histórico de atendimentos e preferências." },
            { icon: BarChart3, title: "Relatórios", desc: "Faturamento, ticket médio, taxa de retorno e muito mais." },
            { icon: Clock, title: "Agendamento Online", desc: "Link público para seus clientes agendarem 24h por dia." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <Button variant="hero" size="lg" className="px-8">
              Começar teste gratuito <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          {loading ? (
            <Button variant="outline" size="lg" className="px-8" disabled>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Carregando...
            </Button>
          ) : demoSlug ? (
            <Link to={`/b/${demoSlug}`}>
              <Button variant="outline" size="lg" className="px-8">
                Ver página de agendamento
              </Button>
            </Link>
          ) : (
            <Link to="/signup">
              <Button variant="outline" size="lg" className="px-8">
                Criar sua barbearia
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
