import { motion } from "framer-motion";
import { Users, TrendingUp, Shield } from "lucide-react";

export function SocialProofSection() {
  return (
    <section className="py-12 sm:py-16 bg-muted/30 border-y border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {["CM", "RO", "AS", "LP"].map((initials, i) => (
                <div
                  key={initials}
                  className="h-8 w-8 rounded-full bg-primary/15 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary"
                  style={{ zIndex: 4 - i }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">+500 barbearias</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-2">
            Barbearias estão começando a organizar suas agendas com CutFlow.
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Profissionais de todo o Brasil já confiam no CutFlow para gerenciar agendamentos, clientes e faturamento.
          </p>

          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Seguro e confiável</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span>Setup em 2 minutos</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>Suporte humanizado</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
