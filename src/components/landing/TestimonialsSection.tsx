import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    barbershop: "Barbearia Prime",
    city: "São Paulo, SP",
    monogram: "BP",
    gradient: "from-emerald-500 to-teal-700",
    content: "Hoje nossa agenda ficou muito mais organizada e as faltas diminuíram bastante. Os clientes adoram receber os lembretes.",
    rating: 5,
  },
  {
    barbershop: "Dom H Barber",
    city: "Porto Alegre, RS",
    monogram: "DH",
    gradient: "from-slate-600 to-slate-800",
    content: "Os lembretes automáticos ajudaram muito na confirmação dos horários. Nosso índice de faltas caiu mais de 30%.",
    rating: 5,
  },
  {
    barbershop: "Black Zone Barber",
    city: "Belo Horizonte, MG",
    monogram: "BZ",
    gradient: "from-zinc-700 to-zinc-900",
    content: "Finalmente conseguimos controlar agenda e clientes sem confusão. O sistema é simples e funciona de verdade.",
    rating: 5,
  },
  {
    barbershop: "Elite Barber Shop",
    city: "Curitiba, PR",
    monogram: "EB",
    gradient: "from-amber-600 to-amber-800",
    content: "Meus barbeiros conseguem ver a agenda deles pelo celular. O controle financeiro melhorou demais desde que começamos a usar.",
    rating: 5,
  },
  {
    barbershop: "Barbearia Central",
    city: "Brasília, DF",
    monogram: "BC",
    gradient: "from-primary to-emerald-700",
    content: "A página de agendamento online trouxe clientes novos toda semana. O retorno do investimento foi quase imediato.",
    rating: 5,
  },
  {
    barbershop: "Barber Club Rio",
    city: "Niterói, RJ",
    monogram: "BR",
    gradient: "from-teal-600 to-cyan-800",
    content: "Trocamos a agenda de papel pelo CutFlow e nunca mais tivemos conflito de horário. A equipe inteira agradeceu.",
    rating: 5,
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
            className="inline-flex items-center gap-2 rounded-full bg-primary/[0.06] border border-primary/12 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5"
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
            Veja como barbearias reais estão organizando seus negócios com CutFlow.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.barbershop}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col group"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-warning text-warning" />
                ))}
              </div>

              {/* Quote */}
              <div className="relative flex-1 mb-5">
                <Quote className="h-5 w-5 text-primary/10 absolute -top-1 -left-0.5" />
                <p className="text-foreground/90 leading-relaxed text-sm sm:text-[15px] pl-5">
                  "{t.content}"
                </p>
              </div>

              {/* Barbershop identity */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-[13px] font-bold text-white shadow-sm group-hover:scale-105 transition-transform`}>
                  {t.monogram}
                </div>
                <div>
                  <p className="font-bold text-sm">{t.barbershop}</p>
                  <p className="text-[11px] text-muted-foreground">{t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
