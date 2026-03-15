import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  { q: "Como funciona o CutFlow?", a: "O CutFlow é uma plataforma completa de gestão para barbearias. Você cria sua conta, configura seus serviços e profissionais, e compartilha um link de agendamento online com seus clientes. Tudo é gerenciado pelo painel administrativo." },
  { q: "Preciso instalar algo?", a: "Não! O CutFlow funciona 100% no navegador. Basta acessar pelo celular, tablet ou computador. Não precisa baixar nenhum aplicativo." },
  { q: "Posso cancelar quando quiser?", a: "Sim! Você pode cancelar sua assinatura a qualquer momento, sem multa ou fidelidade. Seu acesso continua até o final do período pago." },
  { q: "O sistema funciona no celular?", a: "100%! O CutFlow foi pensado mobile first. Funciona perfeitamente em qualquer dispositivo — celular, tablet ou computador." },
  { q: "Posso testar antes de pagar?", a: "Sim! Você tem 7 dias grátis com acesso total a todas as funcionalidades. Não pedimos cartão de crédito para iniciar o teste." },
  { q: "Meus clientes precisam criar conta?", a: "Não! Seus clientes agendam diretamente pelo link público sem precisar criar conta ou baixar app. Simples e rápido." },
  { q: "Vocês oferecem suporte?", a: "Sim! Todos os planos incluem suporte por chat. O plano Premium conta com suporte prioritário." },
  { q: "Os lembretes por WhatsApp são automáticos?", a: "Sim! Após a configuração, o CutFlow envia lembretes automáticos 24h e 2h antes de cada agendamento, reduzindo faltas significativamente." },
];

export function FAQSection() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto relative">
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/[0.06] border border-primary/12 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Dúvidas frequentes
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl font-extrabold tracking-[-0.02em] text-foreground"
          >
            Perguntas frequentes
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-2.5 sm:space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-2xl border border-border/60 bg-card dark:bg-card/60 px-4 sm:px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <AccordionTrigger className="text-left font-semibold text-sm sm:text-base py-4 sm:py-5 hover:no-underline text-foreground">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-xs sm:text-sm pb-4 sm:pb-5 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
