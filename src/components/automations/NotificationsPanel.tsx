import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Send, Clock, AlertCircle, CheckCircle2, Mail, Phone, XCircle, Inbox,
  RefreshCw, MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  sent: { label: "Enviada", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  pending: { label: "Pendente", icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  failed: { label: "Falha", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  skipped: { label: "Aguardando", icon: Clock, color: "text-muted-foreground", bg: "bg-secondary" },
  cancelled: { label: "Cancelada", icon: XCircle, color: "text-muted-foreground", bg: "bg-secondary" },
};

const typeLabels: Record<string, string> = {
  appointment_created: "Confirmação",
  appointment_confirmation: "Confirmação",
  appointment_reminder_24h: "Lembrete 24h",
  appointment_reminder_2h: "Lembrete 2h",
  reactivation_inactive_client: "Reativação 30d",
  reactivation_inactive_client_60: "Reativação 60d",
  reactivation_inactive_client_90: "Reativação 90d",
  reactivation_campaign: "Reativação",
  birthday_campaign: "Aniversário",
  referral_reward: "Indicação",
  post_service: "Pós-atendimento",
  loyalty_earned: "Fidelidade",
  loyalty_near: "Fidelidade (quase lá)",
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <div className="h-14 w-14 rounded-2xl bg-secondary/60 flex items-center justify-center mb-4">
        <Inbox className="h-6 w-6 opacity-40" />
      </div>
      <p className="text-sm font-medium">Nenhuma notificação</p>
      <p className="text-xs mt-1 text-muted-foreground/60">
        As notificações aparecerão aqui quando forem enviadas
      </p>
    </div>
  );
}

function ChannelBadge({ channel }: { channel: string }) {
  if (channel === "whatsapp") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-md font-medium">
        <MessageSquare className="h-2.5 w-2.5" />
        WhatsApp
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded-md font-medium">
      <Mail className="h-2.5 w-2.5" />
      E-mail
    </span>
  );
}

function NotificationItem({
  n,
  index,
  onResend,
}: {
  n: any;
  index: number;
  onResend?: (id: string) => void;
}) {
  const sc = statusConfig[n.error_message && n.status !== "sent" ? "failed" : n.status] || statusConfig.pending;
  const StatusIcon = sc.icon;
  const canResend = n.status === "failed" || (n.status === "skipped" && n.error_message);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border/40 hover:border-border/70 transition-all"
    >
      <div className={`h-9 w-9 rounded-lg ${sc.bg} flex items-center justify-center shrink-0`}>
        <StatusIcon className={`h-4 w-4 ${sc.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium truncate text-foreground">{n.recipient_name || "—"}</p>
          <Badge
            variant="secondary"
            className="text-[10px] shrink-0 font-normal rounded-md border-0 bg-secondary/80"
          >
            {typeLabels[n.type] || n.type}
          </Badge>
          <ChannelBadge channel={n.channel} />
        </div>
        <p className="text-xs text-muted-foreground truncate mt-1 leading-relaxed">
          {n.subject || n.body?.slice(0, 80)}
        </p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {n.channel === "email" && n.recipient_email && (
            <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
              <Mail className="h-2.5 w-2.5" />
              {n.recipient_email}
            </span>
          )}
          {n.channel === "whatsapp" && n.recipient_phone && (
            <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
              <Phone className="h-2.5 w-2.5" />
              {n.recipient_phone}
            </span>
          )}
          {n.scheduled_for && (
            <span className="text-[10px] text-muted-foreground/40 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              Agendado: {format(new Date(n.scheduled_for), "dd/MM HH:mm", { locale: ptBR })}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/40">
            {n.created_at ? format(new Date(n.created_at), "dd/MM/yy HH:mm", { locale: ptBR }) : ""}
          </span>
        </div>
        {n.error_message && (
          <p className="text-[10px] text-destructive mt-1.5 flex items-center gap-1">
            <AlertCircle className="h-2.5 w-2.5" />
            {n.error_message}
          </p>
        )}
      </div>
      {canResend && onResend && (
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-primary"
          onClick={() => onResend(n.id)}
          title="Reenviar"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      )}
    </motion.div>
  );
}

export default function NotificationsPanel({
  notifications,
  onResend,
}: {
  notifications: any[];
  onResend?: (id: string) => void;
}) {
  const sent = notifications.filter((n) => n.status === "sent");
  const pending = notifications.filter((n) => n.status === "pending");
  const failed = notifications.filter((n) => n.status === "failed" || (n.error_message && n.status !== "sent"));
  const whatsappOnly = notifications.filter((n) => n.channel === "whatsapp");

  const renderList = (list: any[]) =>
    list.length === 0 ? (
      <EmptyState />
    ) : (
      <div className="space-y-2">
        {list.map((n, i) => (
          <NotificationItem key={n.id} n={n} index={i} onResend={onResend} />
        ))}
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border/60 bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Send className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Notificações</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Histórico de envios automáticos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatBadge count={sent.length} label="enviadas" variant="success" />
            <StatBadge count={pending.length} label="pendentes" variant="warning" />
            {failed.length > 0 && <StatBadge count={failed.length} label="falhas" variant="destructive" />}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pb-6">
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-secondary/50 p-0.5 rounded-lg flex-wrap">
            <TabsTrigger
              value="all"
              className="text-xs rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              Todas ({notifications.length})
            </TabsTrigger>
            <TabsTrigger
              value="whatsapp"
              className="text-xs rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              WhatsApp ({whatsappOnly.length})
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="text-xs rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              Enviadas ({sent.length})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="text-xs rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              Pendentes ({pending.length})
            </TabsTrigger>
            <TabsTrigger
              value="failed"
              className="text-xs rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              Falhas ({failed.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="max-h-[420px] overflow-y-auto pr-1">
            {renderList(notifications)}
          </TabsContent>
          <TabsContent value="whatsapp" className="max-h-[420px] overflow-y-auto pr-1">
            {renderList(whatsappOnly)}
          </TabsContent>
          <TabsContent value="sent" className="max-h-[420px] overflow-y-auto pr-1">
            {renderList(sent)}
          </TabsContent>
          <TabsContent value="pending" className="max-h-[420px] overflow-y-auto pr-1">
            {renderList(pending)}
          </TabsContent>
          <TabsContent value="failed" className="max-h-[420px] overflow-y-auto pr-1">
            {renderList(failed)}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}

function StatBadge({
  count,
  label,
  variant,
}: {
  count: number;
  label: string;
  variant: "success" | "warning" | "destructive";
}) {
  const styles = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${styles[variant]}`}>
      {count} {label}
    </span>
  );
}
