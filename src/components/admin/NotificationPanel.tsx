import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Bell, Calendar, Clock, UserCheck, UserPlus, XCircle,
  CalendarOff, CheckCheck, Loader2, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

type NotifCategory = "all" | "bookings" | "clients" | "schedule";

interface ActivityItem {
  id: string;
  type: "new_booking" | "cancellation" | "completed" | "confirmed" | "new_client" | "rescheduled";
  title: string;
  description: string;
  timestamp: string;
  category: NotifCategory;
  read: boolean;
}

const categoryConfig: Record<NotifCategory, { label: string }> = {
  all: { label: "Todas" },
  bookings: { label: "Agendamentos" },
  clients: { label: "Clientes" },
  schedule: { label: "Alterações" },
};

const typeConfig: Record<string, { icon: typeof Calendar; color: string; bg: string }> = {
  new_booking: { icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
  confirmed: { icon: CheckCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  completed: { icon: UserCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  cancellation: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  rescheduled: { icon: RefreshCw, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  new_client: { icon: UserPlus, color: "text-primary", bg: "bg-primary/10" },
};

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<NotifCategory>("all");
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const { barbershop } = useBarbershop();

  const fetchActivity = useCallback(async () => {
    if (!barbershop) return;
    setLoading(true);

    try {
      const [apptRes, clientRes] = await Promise.all([
        supabase
          .from("appointments")
          .select("id, client_name, status, date, start_time, created_at, updated_at, services(name), professionals(name)")
          .eq("barbershop_id", barbershop.id)
          .order("updated_at", { ascending: false })
          .limit(30),
        supabase
          .from("clients")
          .select("id, name, created_at")
          .eq("barbershop_id", barbershop.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const items: ActivityItem[] = [];

      (apptRes.data || []).forEach((a: any) => {
        const proName = a.professionals?.name?.split(" ")[0] || "";
        const svcName = a.services?.name || "";
        const dateStr = a.date ? format(new Date(a.date + "T12:00:00"), "dd/MM", { locale: ptBR }) : "";

        if (a.status === "scheduled") {
          items.push({
            id: `appt-new-${a.id}`,
            type: "new_booking",
            title: "Novo agendamento",
            description: `${a.client_name} · ${svcName}${proName ? ` com ${proName}` : ""} · ${dateStr} ${a.start_time?.slice(0, 5) || ""}`,
            timestamp: a.created_at,
            category: "bookings",
            read: false,
          });
        } else if (a.status === "confirmed") {
          items.push({
            id: `appt-conf-${a.id}`,
            type: "confirmed",
            title: "Agendamento confirmado",
            description: `${a.client_name} confirmou · ${dateStr} ${a.start_time?.slice(0, 5) || ""}`,
            timestamp: a.updated_at,
            category: "bookings",
            read: false,
          });
        } else if (a.status === "cancelled") {
          items.push({
            id: `appt-cancel-${a.id}`,
            type: "cancellation",
            title: "Cancelamento",
            description: `${a.client_name} cancelou · ${svcName} · ${dateStr}`,
            timestamp: a.updated_at,
            category: "schedule",
            read: false,
          });
        } else if (a.status === "completed") {
          items.push({
            id: `appt-done-${a.id}`,
            type: "completed",
            title: "Atendimento concluído",
            description: `${a.client_name} · ${svcName}${proName ? ` com ${proName}` : ""}`,
            timestamp: a.updated_at,
            category: "bookings",
            read: false,
          });
        } else if (a.status === "rescheduled") {
          items.push({
            id: `appt-resch-${a.id}`,
            type: "rescheduled",
            title: "Remarcação",
            description: `${a.client_name} remarcou · ${dateStr} ${a.start_time?.slice(0, 5) || ""}`,
            timestamp: a.updated_at,
            category: "schedule",
            read: false,
          });
        }
      });

      (clientRes.data || []).forEach((c: any) => {
        items.push({
          id: `client-${c.id}`,
          type: "new_client",
          title: "Novo cliente",
          description: `${c.name} foi cadastrado`,
          timestamp: c.created_at,
          category: "clients",
          read: false,
        });
      });

      // Sort by timestamp desc
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Mark older items as read (keep first 5 as unread)
      items.forEach((item, i) => {
        item.read = i >= 5 || readIds.has(item.id);
      });

      setActivities(items);
    } catch (e) {
      console.error("Error fetching notifications:", e);
    } finally {
      setLoading(false);
    }
  }, [barbershop, readIds]);

  useEffect(() => {
    if (open) fetchActivity();
  }, [open, fetchActivity]);

  const filtered = useMemo(() => {
    if (category === "all") return activities;
    return activities.filter((a) => a.category === category);
  }, [activities, category]);

  const unreadCount = useMemo(() => activities.filter((a) => !a.read && !readIds.has(a.id)).length, [activities, readIds]);

  const markAllRead = () => {
    setReadIds(new Set(activities.map((a) => a.id)));
  };

  const markRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const isUnread = (item: ActivityItem) => !item.read && !readIds.has(item.id);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground transition-colors h-9 w-9"
        >
          <Bell className="h-[18px] w-[18px]" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-card"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] sm:w-[400px] p-0 rounded-2xl border-border/60 bg-card shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3
            className="text-sm font-semibold text-foreground"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Notificações
          </h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] h-7 px-2 text-muted-foreground hover:text-foreground"
                onClick={markAllRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border/40 overflow-x-auto">
          {(Object.keys(categoryConfig) as NotifCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {categoryConfig[cat].label}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <ScrollArea className="max-h-[380px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-10 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                <Bell className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {category === "all" ? "Nenhuma notificação ainda" : "Nenhuma notificação nesta categoria"}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1.5 max-w-[220px]">
                {category === "all"
                  ? "Você receberá alertas sobre agendamentos, clientes e alterações na agenda."
                  : "Novas atividades aparecerão aqui automaticamente."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filtered.map((item) => {
                const cfg = typeConfig[item.type] || typeConfig.new_booking;
                const Icon = cfg.icon;
                const unread = isUnread(item);
                let timeAgo = "";
                try {
                  timeAgo = formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: ptBR });
                } catch {
                  timeAgo = "";
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => markRead(item.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30 ${
                      unread ? "bg-primary/[0.02]" : ""
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-semibold truncate ${unread ? "text-foreground" : "text-muted-foreground"}`}>
                          {item.title}
                        </p>
                        {unread && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
                        {item.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/40 mt-1 font-medium">
                        {timeAgo}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="border-t border-border/40 px-4 py-2.5 text-center">
            <p className="text-[10px] text-muted-foreground/50 font-medium">
              Mostrando as {filtered.length} atividades mais recentes
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
