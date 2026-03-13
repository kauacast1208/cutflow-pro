import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos M.",
    role: "Proprietário",
    barbershop: "Barbearia Premium",
    city: "São Paulo, SP",
    content: "Reduzi as faltas pela metade depois que comecei a usar os lembretes automáticos. Finalmente tenho controle real do meu faturamento.",
    rating: 5,
    metric: "Menos faltas",
    metricLabel: "com lembretes",
    avatar: "CM",
    avatarGradient: "from-emerald-400 to-primary",
  },
  {
    name: "Rafael O.",
    role: "Barbeiro Autônomo",
    barbershop: "Studio do Rafael",
    city: "Belo Horizonte, MG",
    content: "Um sistema simples e bonito. Meus clientes adoram agendar online e eu tenho tudo organizado no celular. Não volto mais para a agenda no papel.",
    rating: 5,
    metric: "Mais organização",
    metricLabel: "no dia a dia",
    avatar: "RO",
    avatarGradient: "from-blue-400 to-primary",
  },
  {
    name: "André S.",
    role: "Sócio-gerente",
    barbershop: "Barber & Co",
    city: "Rio de Janeiro, RJ",
    content: "Gerencio minha equipe inteira pelo CutFlow. Os relatórios me dão visibilidade total do negócio — sei exatamente o faturamento de cada profissional.",
    rating: 5,
    metric: "Controle total",
    metricLabel: "da equipe",
    avatar: "AS",
    avatarGradient: "from-amber-400 to-primary",
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="absolute inset-0 glow-bg opacity-30" />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5"
          >
            Depoimentos
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-4 sm:mb-5"
          >
            Quem usa, recomenda.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto"
          >
            Veja como barbeiros reais estão organizando seus negócios.
          </motion.p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col group"
            >
              {/* Metric highlight */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-warning text-warning" />
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm font-bold text-primary">{t.metric}</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">{t.metricLabel}</p>
                </div>
              </div>

              {/* Quote */}
              <div className="relative flex-1 mb-5 sm:mb-7">
                <Quote className="h-5 w-5 text-primary/15 absolute -top-1 -left-1" />
                <p className="text-foreground leading-relaxed text-sm sm:text-[15px] pl-4">
                  {t.content}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 sm:pt-5 border-t border-border">
                <div className={`h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br ${t.avatarGradient} flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-md group-hover:scale-105 transition-transform`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">{t.role} · {t.barbershop}</p>
                  <p className="text-[10px] text-muted-foreground/70">{t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
