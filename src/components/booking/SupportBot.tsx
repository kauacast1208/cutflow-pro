import { useState } from "react";
import { X, ChevronRight, ArrowLeft, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAQ = [
  {
    q: "Como marcar um horário?",
    a: "Escolha o serviço desejado, selecione o profissional, escolha a data e horário disponíveis, preencha seus dados e confirme. Pronto!",
  },
  {
    q: "Como escolher outro dia?",
    a: "Na etapa de data e horário, navegue pelo calendário para encontrar o dia desejado. Os dias com horários disponíveis estarão habilitados.",
  },
  {
    q: "Posso cancelar meu agendamento?",
    a: "Sim! Após confirmar, você verá a opção de cancelar na tela de confirmação. Respeite o prazo mínimo definido pela barbearia.",
  },
  {
    q: "Posso remarcar meu horário?",
    a: "Claro! Na tela de confirmação existe a opção de remarcar. Basta selecionar uma nova data e horário disponíveis.",
  },
  {
    q: "Como falar com a barbearia?",
    a: "Use o WhatsApp ou telefone da barbearia, que geralmente está disponível no perfil. Se precisar, pergunte diretamente ao profissional.",
  },
];

export default function SupportBot() {
  const [open, setOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(!open); setSelectedFaq(null); }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        aria-label="Suporte"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          /* Friendly bot/headset SVG icon */
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a7 7 0 0 0-7 7v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H6a5 5 0 0 1 10 0h-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1.5" />
            <path d="M18 13a1 1 0 0 0 1-1V9a7 7 0 0 0-1-3.6" />
            <circle cx="12" cy="19" r="2" />
            <path d="M14 19h2a2 2 0 0 0 2-2v-1" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[360px] max-h-[460px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="bg-primary px-5 py-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-primary-foreground" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a7 7 0 0 0-7 7v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H6a5 5 0 0 1 10 0h-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1.5" />
                <path d="M18 13a1 1 0 0 0 1-1V9a7 7 0 0 0-1-3.6" />
                <circle cx="12" cy="19" r="2" />
                <path d="M14 19h2a2 2 0 0 0 2-2v-1" />
              </svg>
            </div>
            <div>
              <p className="text-primary-foreground font-semibold text-sm">Assistente CutFlow</p>
              <p className="text-primary-foreground/70 text-xs">Ajuda com agendamento</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedFaq === null ? (
              <div className="space-y-2">
                <div className="rounded-xl bg-accent/50 p-3 mb-3">
                  <p className="text-sm text-foreground">
                    Olá! Como posso ajudar? Escolha uma dúvida abaixo:
                  </p>
                </div>
                {FAQ.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedFaq(i)}
                    className="w-full flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left text-sm hover:bg-accent hover:border-primary/20 transition-all duration-150"
                  >
                    <span className="font-medium text-foreground">{item.q}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-accent/50 p-3">
                  <p className="font-medium text-sm text-foreground">{FAQ[selectedFaq].q}</p>
                </div>
                <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                  <p className="text-sm text-foreground leading-relaxed">{FAQ[selectedFaq].a}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg"
                    onClick={() => setSelectedFaq(null)}
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    Voltar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 rounded-lg"
                    onClick={() => { setSelectedFaq(null); setOpen(false); }}
                  >
                    <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                    Entendi
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5">
            <p className="text-[11px] text-muted-foreground text-center">
              Assistente automático do CutFlow
            </p>
          </div>
        </div>
      )}
    </>
  );
}
