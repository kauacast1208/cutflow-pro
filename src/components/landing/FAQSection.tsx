import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Como funciona o CutFlow?", a: "O CutFlow e uma plataforma completa de gestao para barbearias. Voce cria sua conta, configura seus servicos e profissionais, e compartilha um link de agendamento online com seus clientes. Tudo e gerenciado pelo painel administrativo." },
  { q: "Preciso instalar algo?", a: "Nao! O CutFlow funciona 100% no navegador. Basta acessar pelo celular, tablet ou computador. Nao precisa baixar nenhum aplicativo." },
  { q: "Posso cancelar quando quiser?", a: "Sim! Voce pode cancelar sua assinatura a qualquer momento, sem multa ou fidelidade. Seu acesso continua ate o final do periodo pago." },
  { q: "O sistema funciona no celular?", a: "100%! O CutFlow foi pensado mobile first. Funciona perfeitamente em qualquer dispositivo — celular, tablet ou computador." },
  { q: "Posso testar antes de pagar?", a: "Sim! Voce tem 7 dias gratis com acesso total a todas as funcionalidades. Nao pedimos cartao de credito para iniciar o teste." },
  { q: "Meus clientes precisam criar conta?", a: "Nao! Seus clientes agendam diretamente pelo link publico sem precisar criar conta ou baixar app. Simples e rapido." },
  { q: "Voces oferecem suporte?", a: "Sim! Todos os planos incluem suporte por chat. O plano Premium conta com suporte prioritario." },
];

export function FAQSection() {
  return (
    <section className="section-padding bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-[-0.02em]">Perguntas frequentes</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-2.5 sm:space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-border bg-card px-4 sm:px-6 shadow-card">
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
