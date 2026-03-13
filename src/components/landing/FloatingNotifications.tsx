import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, CheckCircle, Clock, MessageSquare, CalendarPlus } from "lucide-react";

interface Notification {
  icon: typeof CalendarCheck;
  message: string;
  shop: string;
  time: string;
  color: string;
}

const notifications: Notification[] = [
  { icon: CalendarPlus, message: "Novo agendamento criado", shop: "Barbearia Prime", time: "agora", color: "text-primary" },
  { icon: CheckCircle, message: "Cliente confirmou horário", shop: "Elite Barber Shop", time: "2 min atrás", color: "text-emerald-500" },
  { icon: Clock, message: "Horário liberado às 19:00", shop: "Dom H Barber", time: "agora", color: "text-blue-500" },
  { icon: MessageSquare, message: "Lembrete enviado no WhatsApp", shop: "Black Zone Barber", time: "3 min atrás", color: "text-teal-500" },
  { icon: CalendarCheck, message: "Novo horário disponível", shop: "Barbearia Central", time: "1 min atrás", color: "text-amber-500" },
  { icon: CalendarPlus, message: "Novo agendamento criado", shop: "Barber Club Rio", time: "agora", color: "text-primary" },
  { icon: CheckCircle, message: "Cliente confirmou horário", shop: "Barbearia Prime", time: "4 min atrás", color: "text-emerald-500" },
  { icon: Clock, message: "Horário liberado às 15:30", shop: "Elite Barber Shop", time: "agora", color: "text-blue-500" },
];

export function FloatingNotifications() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % notifications.length);
        setVisible(true);
      }, 400);
    }, 8000);

    return () => clearInterval(interval);
  }, [dismissed]);

  if (dismissed) return null;

  const notif = notifications[current];
  const Icon = notif.icon;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-[340px] hidden sm:block">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-lg px-4 py-3 flex items-start gap-3 group cursor-default"
          >
            <div className={`mt-0.5 ${notif.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground leading-snug">
                {notif.message}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {notif.shop} — <span className="text-muted-foreground/70">{notif.time}</span>
              </p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-muted-foreground/40 hover:text-muted-foreground text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Fechar"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
