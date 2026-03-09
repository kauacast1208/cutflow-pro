import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Como funciona o CutFlow?", a: "O CutFlow é uma plataforma completa de gestão para barbearias. Você cria sua conta, configura seus serviços e profissionais, e compartilha um link de agendamento online com seus clientes. Tudo é gerenciado pelo painel administrativo." },
  { q: "Preciso pagar para testar?", a: "Não! Você tem 7 dias grátis com acesso total a todas as funcionalidades. Não pedimos cartão de crédito para iniciar o teste." },
  { q: "Meus clientes podem agendar sozinhos?", a: "Sim! Cada barbearia recebe um link único de agendamento. Seus clientes escolhem serviço, profissional, data e horário sem precisar baixar app ou criar conta." },
  { q: "Posso cancelar agendamentos?", a: "Sim. Tanto você quanto seus clientes podem cancelar ou remarcar agendamentos. Você configura as regras de cancelamento nas configurações." },
  { q: "Funciona no celular?", a: "100%! O CutFlow funciona perfeitamente em qualquer dispositivo — celular, tablet ou computador. A experiência é otimizada para mobile." },
  { q: "Vocês oferecem suporte?", a: "Sim! Todos os planos incluem suporte por chat. O plano Premium conta com suporte prioritário." },
];

export function FAQSection() {
  return (
    <section className="section-padding bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-medium text-primary mb-3">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-bold">Perguntas frequentes</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-border bg-card px-6 shadow-card">
              <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
