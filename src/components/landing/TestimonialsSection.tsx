import { motion } from "framer-motion";
import { Star, Quote, MapPin } from "lucide-react";

import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";
import testimonial4 from "@/assets/testimonial-4.jpg";
import testimonial5 from "@/assets/testimonial-5.jpg";
import testimonial6 from "@/assets/testimonial-6.jpg";

const testimonials = [
  {
    name: "Rafael Mendes",
    role: "Proprietário",
    barbershop: "Barbearia Prime",
    city: "São Paulo, SP",
    photo: testimonial1,
    content: "O CutFlow organizou totalmente nossa agenda. As faltas diminuíram e os clientes adoram os lembretes automáticos pelo WhatsApp.",
    rating: 5,
    highlight: "Faltas reduziram 40%",
  },
  {
    name: "Diego Hartmann",
    role: "Fundador",
    barbershop: "Dom H Barber",
    city: "Porto Alegre, RS",
    photo: testimonial2,
    content: "As faltas diminuíram muito desde que começamos a usar. O índice caiu mais de 30% no primeiro mês. Ferramenta indispensável.",
    rating: 5,
    highlight: "-30% no-shows",
  },
  {
    name: "Lucas Oliveira",
    role: "Gerente",
    barbershop: "Black Zone Barber",
    city: "Curitiba, PR",
    photo: testimonial3,
    content: "Agora conseguimos controlar clientes e horários fácil, sem papel e sem confusão. Sistema simples, bonito e eficiente.",
    rating: 5,
    highlight: "Zero papel",
  },
  {
    name: "Eduardo Bastos",
    role: "Proprietário",
    barbershop: "Elite Barber",
    city: "Rio de Janeiro, RJ",
    photo: testimonial4,
    content: "Meus barbeiros acessam a agenda pelo celular. O controle financeiro melhorou demais com os relatórios automáticos.",
    rating: 5,
    highlight: "Controle total",
  },
  {
    name: "Thiago Almeida",
    role: "Sócio",
    barbershop: "Barbearia Central",
    city: "Belo Horizonte, MG",
    photo: testimonial5,
    content: "A página de agendamento online trouxe clientes novos toda semana. O retorno foi quase imediato após ativar.",
    rating: 5,
    highlight: "+25% clientes novos",
  },
  {
    name: "Marcelo Souza",
    role: "Fundador",
    barbershop: "Barber Club",
    city: "Florianópolis, SC",
    photo: testimonial6,
    content: "Trocamos a agenda de papel pelo CutFlow e nunca mais tivemos conflito de horário. A equipe inteira agradeceu.",
    rating: 5,
    highlight: "0 conflitos",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
      {/* Background: uses semantic tokens for both themes */}
      <div className="absolute inset-0 bg-secondary/50 dark:bg-[hsl(220,20%,5%)]" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/[0.03] dark:bg-primary/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/[0.02] dark:bg-[hsl(270,40%,20%)]/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-18">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] border border-primary/15 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-5"
          >
            <Star className="h-3.5 w-3.5 fill-primary" />
            Depoimentos reais
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground mb-5"
          >
            Quem usa, recomenda.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Veja como barbearias reais estão transformando seus negócios com o CutFlow.
          </motion.p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.barbershop}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group relative rounded-2xl border border-border dark:border-white/[0.06] bg-card dark:bg-white/[0.03] backdrop-blur-sm p-6 sm:p-7 hover:border-primary/20 dark:hover:bg-white/[0.05] transition-all duration-500 shadow-card"
            >
              {/* Highlight badge */}
              <div className="absolute -top-3 right-5">
                <span className="inline-block bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold px-3 py-1 rounded-full">
                  {t.highlight}
                </span>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <div className="relative mb-6">
                <Quote className="h-6 w-6 text-primary/15 absolute -top-1 -left-1" />
                <p className="text-foreground/80 dark:text-white/80 leading-relaxed text-[15px] pl-6">
                  "{t.content}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3.5 pt-5 border-t border-border dark:border-white/[0.06]">
                <img
                  src={t.photo}
                  alt={t.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground">{t.name}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {t.role} · {t.barbershop}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="h-2.5 w-2.5 text-primary/60" />
                    <p className="text-[11px] text-muted-foreground/70">{t.city}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom social proof bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-muted-foreground text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[testimonial1, testimonial2, testimonial3, testimonial4].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-background"
                />
              ))}
            </div>
            <span className="text-foreground/60 font-medium">+200 barbearias</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-foreground/60 font-medium">4.9/5 avaliação média</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
