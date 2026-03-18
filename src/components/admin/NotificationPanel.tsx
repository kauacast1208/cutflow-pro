import { useState } from "react";
import { Bell, Calendar, Clock, UserCheck, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground transition-colors h-9 w-9"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 rounded-2xl border-border/60 bg-card shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <h3
            className="text-sm font-semibold text-foreground"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Notificações
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => setOpen(false)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Empty state */}
        <div className="px-4 py-10 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
            <Bell className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Nenhuma notificação ainda
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1.5 max-w-[220px]">
            Você receberá alertas sobre agendamentos, cancelamentos, lembretes e mais.
          </p>
        </div>

        {/* Future notification types hint */}
        <div className="border-t border-border/60 px-4 py-3 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/50 mb-2">
            Em breve
          </p>
          {[
            { icon: Calendar, text: "Novos agendamentos" },
            { icon: UserCheck, text: "Confirmações de clientes" },
            { icon: Clock, text: "Lembretes automáticos" },
            { icon: MessageSquare, text: "Respostas de campanhas" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2.5 text-xs text-muted-foreground/50"
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
