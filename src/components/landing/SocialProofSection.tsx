import { motion } from "framer-motion";
import { TrendingUp, Shield, Zap } from "lucide-react";

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
          <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-2">
            Feito para barbearias modernas que querem profissionalizar sua gestão.
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Organização, controle e crescimento em uma plataforma simples e segura.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Seguro e confiável</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span>Setup em menos de 5 minutos</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span>Resultados desde o primeiro dia</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
