import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <section className="section-padding bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5">
            Dúvidas frequentes
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-[-0.02em]">Perguntas frequentes</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-2.5 sm:space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl border border-border/80 bg-card px-4 sm:px-6 shadow-card">
              <AccordionTrigger className="text-left font-medium text-sm sm:text-base py-3.5 sm:py-4 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-xs sm:text-sm pb-3.5 sm:pb-4 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
