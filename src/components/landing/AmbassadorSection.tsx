import { motion } from "framer-motion";
import { Gift, Link2, Users, TrendingUp } from "lucide-react";

const benefits = [
  { icon: Link2, title: "Links de indicação", description: "Cada embaixador recebe um link exclusivo para compartilhar." },
  { icon: Users, title: "Acompanhe convites", description: "Veja quem foi indicado e o status de cada conversão." },
  { icon: Gift, title: "Recompensas", description: "Ganhe benefícios a cada novo cliente que se cadastrar." },
  { icon: TrendingUp, title: "Cresça organicamente", description: "Expansão real, impulsionada pela sua comunidade." },
];

export function AmbassadorSection() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />
      </div>
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/[0.06] border border-primary/12 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5"
          >
            <Gift className="h-3.5 w-3.5" />
            Programa de embaixadores
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-3 sm:mb-4"
          >
            Indique, ganhe e{" "}
            <span className="text-primary">cresça junto</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-[15px] sm:text-lg max-w-lg mx-auto leading-relaxed"
          >
            Recomende o CutFlow para outros barbeiros e seja recompensado por cada conversão.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group card-premium p-5 sm:p-6 card-lift"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.06] group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <b.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1">{b.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{b.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
