import { motion } from "framer-motion";
import { Shield, Zap, Smartphone, Lock } from "lucide-react";

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
            Plataforma profissional para barbearias que levam o negócio a sério.
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Organização, controle e crescimento com segurança e simplicidade.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Dados seguros e protegidos</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span>Setup em menos de 5 minutos</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Smartphone className="h-3.5 w-3.5 text-primary" />
              <span>Funciona no celular e computador</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span>Pagamento seguro via Stripe</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
