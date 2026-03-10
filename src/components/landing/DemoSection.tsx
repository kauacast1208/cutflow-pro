import { motion } from "framer-motion";
import { Calendar, BarChart3, Users, LayoutDashboard } from "lucide-react";

const screens = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Visao geral do seu negocio com metricas em tempo real.",
    mockRows: ["Faturamento hoje: R$ 1.240", "Agendamentos: 12", "Barbeiro destaque: Carlos"],
  },
  {
    icon: Calendar,
    title: "Agenda",
    description: "Visualizacao por dia, semana e profissional.",
    mockRows: ["09:00 — Corte + Barba · Carlos", "10:30 — Corte Masculino · Rafael", "11:00 — Barba · Andre"],
  },
  {
    icon: BarChart3,
    title: "Relatorios",
    description: "Faturamento, ticket medio e ranking de profissionais.",
    mockRows: ["Faturamento mensal: R$ 18.500", "Ticket medio: R$ 65", "Taxa de retorno: 78%"],
  },
  {
    icon: Users,
    title: "Clientes",
    description: "CRM completo com historico e tags automaticas.",
    mockRows: ["248 clientes ativos", "32 clientes VIP", "15 aniversariantes este mes"],
  },
];

export function DemoSection() {
  return (
    <section className="section-padding bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 glow-bg opacity-30" />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-10 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5"
          >
            O sistema
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-4 sm:mb-5"
          >
            Conheca o CutFlow por dentro
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Telas reais do sistema que vai transformar sua barbearia.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {screens.map((screen, i) => (
            <motion.div
              key={screen.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl sm:rounded-2xl border border-border bg-card shadow-card overflow-hidden hover:shadow-elevated transition-all duration-300"
            >
              {/* Screen header */}
              <div className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-3 border-b border-border bg-muted/20">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-destructive/30" />
                  <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-warning/30" />
                  <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-primary/30" />
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground font-medium">
                  <screen.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {screen.title}
                </div>
              </div>
              {/* Screen content */}
              <div className="p-4 sm:p-5">
                <h3 className="font-bold text-sm sm:text-base mb-1">{screen.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{screen.description}</p>
                <div className="space-y-1.5 sm:space-y-2">
                  {screen.mockRows.map((row, j) => (
                    <div key={j} className="flex items-center gap-2 sm:gap-2.5 rounded-lg border border-border bg-background px-3 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs text-muted-foreground">
                      <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary/60 shrink-0" />
                      <span className="truncate">{row}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
