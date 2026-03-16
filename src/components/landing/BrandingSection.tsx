import { motion } from "framer-motion";
import { Palette, Scissors, ExternalLink } from "lucide-react";

export function BrandingSection() {
  return (
    <section className="section-padding bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 glow-bg opacity-30" />
      <div className="max-w-5xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div className="grid grid-cols-2 gap-3">
              {/* Sidebar mockup */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <p className="text-[9px] text-muted-foreground mb-3 uppercase tracking-wider font-semibold">Painel admin</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Scissors className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold">Sua Barbearia</p>
                    <p className="text-[8px] text-muted-foreground">Logo personalizado</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {["Dashboard", "Agenda", "Clientes"].map((item) => (
                    <div key={item} className="h-6 rounded-lg bg-muted/40 flex items-center px-2">
                      <span className="text-[8px] text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Public page mockup */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <p className="text-[9px] text-muted-foreground mb-3 uppercase tracking-wider font-semibold">Página pública</p>
                <div className="text-center py-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Scissors className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-[10px] font-bold">Sua Barbearia</p>
                  <p className="text-[8px] text-muted-foreground">Agende seu horário</p>
                </div>
                <div className="flex items-center gap-1 text-[8px] text-primary justify-center">
                  <ExternalLink className="h-2.5 w-2.5" />
                  cutflow.app/sua-barbearia
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.06] border border-primary/12 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5">
              <Palette className="h-3.5 w-3.5" />
              Personalização
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[-0.02em] mb-4 sm:mb-5">
              Sua marca em{" "}
              <span className="text-primary">todo o sistema</span>
            </h2>
            <p className="text-muted-foreground text-[15px] sm:text-base leading-relaxed mb-6 max-w-md">
              Faça upload do logotipo da sua barbearia e ele aparece no painel administrativo e na página pública de agendamento. Experiência profissional com sua identidade visual.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
