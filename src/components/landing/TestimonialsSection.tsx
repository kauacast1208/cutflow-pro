import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Barbearia Premium · São Paulo",
    content: "O CutFlow transformou meu negócio. Reduzi faltas em 60% e aumentei o faturamento em 40% nos primeiros 3 meses.",
    rating: 5,
    avatar: "CS",
  },
  {
    name: "Rafael Santos",
    role: "Barbeiro Autônomo · BH",
    content: "Finalmente um sistema simples e bonito. Meus clientes adoram agendar online e eu tenho tudo organizado no celular.",
    rating: 5,
    avatar: "RS",
  },
  {
    name: "André Oliveira",
    role: "Rede Barber & Co · RJ",
    content: "Gerencio 3 unidades com o CutFlow. Os relatórios financeiros me dão visibilidade total do negócio.",
    rating: 5,
    avatar: "AO",
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="absolute inset-0 glow-bg opacity-30" />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-10 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5"
          >
            Feito para barbearias modernas
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-4 sm:mb-5"
          >
            Quem usa, recomenda
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto"
          >
            Barbearias estão começando a usar o CutFlow para organizar seus atendimentos.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col"
            >
              <div className="flex gap-0.5 mb-4 sm:mb-5">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-foreground mb-5 sm:mb-7 leading-relaxed flex-1 text-sm sm:text-[15px]">"{t.content}"</p>
              <div className="flex items-center gap-3 pt-4 sm:pt-5 border-t border-border">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs sm:text-sm font-bold text-primary">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
