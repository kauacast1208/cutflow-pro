import { motion } from "framer-motion";
import { XCircle, CheckCircle2 } from "lucide-react";

const before = [
  "Agenda no WhatsApp",
  "Clientes esquecendo horários",
  "Horários perdidos",
  "Falta de controle financeiro",
];

const after = [
  "Agenda profissional",
  "Lembretes automáticos",
  "Mais comparecimento",
  "Controle do faturamento",
];

export function ComparisonSection() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-3 sm:mb-4"
          >
            De caos para organização
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-destructive/20 bg-destructive/[0.03] p-6 sm:p-8"
          >
            <p className="text-sm font-bold text-destructive uppercase tracking-wider mb-5">
              Sem CutFlow
            </p>
            <ul className="space-y-4">
              {before.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-destructive/70 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-[15px] text-muted-foreground leading-snug">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 sm:p-8"
          >
            <p className="text-sm font-bold text-primary uppercase tracking-wider mb-5">
              Com CutFlow
            </p>
            <ul className="space-y-4">
              {after.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-[15px] text-foreground font-medium leading-snug">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
