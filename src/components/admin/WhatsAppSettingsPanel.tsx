import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { sendWhatsApp } from "@/services/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Send, CheckCircle2, XCircle, MessageCircle, Wifi, WifiOff,
  Bell, Clock, AlertTriangle, RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

interface NotificationLog {
  id: string;
  type: string;
  channel: string;
  status: string;
  recipient_name: string | null;
  recipient_phone: string | null;
  body: string | null;
  sent_at: string | null;
  created_at: string;
  error_message: string | null;
  scheduled_for: string | null;
}

const statusColors: Record<string, string> = {
  sent: "bg-green-500/10 text-green-600 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const typeLabels: Record<string, string> = {
  appointment_created: "Confirmação",
  appointment_reminder_24h: "Lembrete 24h",
  appointment_reminder_2h: "Lembrete 2h",
  appointment_reminder_1h: "Lembrete 1h",
  post_service: "Pós-atendimento",
  birthday_campaign: "Aniversário",
  reactivation_campaign: "Reativação",
};

export default function WhatsAppSettingsPanel() {
  const { barbershop } = useBarbershop();
  const { toast } = useToast();

  // Test panel state
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    "Olá! 👋 Este é um teste do CutFlow. Se você recebeu esta mensagem, a integração WhatsApp está funcionando! ✅"
  );
  const [sending, setSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string; messageId?: string; provider?: string } | null>(null);

  // Integration status
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<"connected" | "disconnected" | "unknown">("unknown");
  const [providerName, setProviderName] = useState<string>("");

  // Notification logs
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // WhatsApp automation toggle
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [savingToggle, setSavingToggle] = useState(false);

  // Stats
  const [stats, setStats] = useState({ sent: 0, pending: 0, failed: 0, total: 0 });

  useEffect(() => {
    checkIntegration();
    fetchLogs();
    fetchWhatsappToggle();
  }, [barbershop]);

  const checkIntegration = async () => {
    setCheckingStatus(true);
    try {
      // Ping the send-whatsapp function with a dry-run style check
      const { data, error } = await supabase.functions.invoke("send-whatsapp", {
        body: { phone: "test", message: "ping" },
      });

      if (error?.message?.includes("503") || data?.error?.includes("No WhatsApp provider")) {
        setIntegrationStatus("disconnected");
      } else if (data?.success || data?.error) {
        // Even if sending fails (e.g. invalid number), provider is connected
        setIntegrationStatus("connected");
        setProviderName(data?.provider || "");
      } else {
        setIntegrationStatus("connected");
      }
    } catch {
      setIntegrationStatus("unknown");
    }
    setCheckingStatus(false);
  };

  const fetchLogs = async () => {
    if (!barbershop) return;
    setLoadingLogs(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("barbershop_id", barbershop.id)
      .eq("channel", "whatsapp")
      .order("created_at", { ascending: false })
      .limit(50);

    const notifs = (data || []) as NotificationLog[];
    setLogs(notifs);

    const sent = notifs.filter((n) => n.status === "sent").length;
    const pending = notifs.filter((n) => n.status === "pending").length;
    const failed = notifs.filter((n) => n.status === "failed").length;
    setStats({ sent, pending, failed, total: notifs.length });
    setLoadingLogs(false);
  };

  const fetchWhatsappToggle = async () => {
    if (!barbershop) return;
    const { data } = await supabase
      .from("automations")
      .select("enabled")
      .eq("barbershop_id", barbershop.id)
      .eq("type", "appointment_confirmation")
      .single();
    // Default to enabled if no record
    setWhatsappEnabled(data ? data.enabled : true);
  };

  const handleToggleWhatsapp = async (enabled: boolean) => {
    if (!barbershop) return;
    setSavingToggle(true);
    setWhatsappEnabled(enabled);

    const { data: existing } = await supabase
      .from("automations")
      .select("id")
      .eq("barbershop_id", barbershop.id)
      .eq("type", "appointment_confirmation")
      .single();

    if (existing) {
      await supabase.from("automations").update({ enabled } as any).eq("id", existing.id);
    } else {
      await supabase.from("automations").insert({
        barbershop_id: barbershop.id,
        type: "appointment_confirmation",
        enabled,
        config: { channel: "whatsapp" },
      } as any);
    }

    setSavingToggle(false);
    toast({ title: enabled ? "WhatsApp ativado!" : "WhatsApp desativado" });
  };

  const handleSendTest = async () => {
    if (!phone.trim()) return;
    setSending(true);
    setTestResult(null);
    const res = await sendWhatsApp(phone.trim(), message);
    setTestResult(res);
    setSending(false);
    if (res.success) fetchLogs();
  };

  return (
    <div className="space-y-6">
      {/* Integration Status */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              Status da Integração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {checkingStatus ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : integrationStatus === "connected" ? (
                  <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Wifi className="h-5 w-5 text-green-600" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <WifiOff className="h-5 w-5 text-red-500" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {checkingStatus
                      ? "Verificando..."
                      : integrationStatus === "connected"
                      ? "Conectado"
                      : "Desconectado"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {integrationStatus === "connected" && providerName
                      ? `Provedor: ${providerName.replace("_", " ").toUpperCase()}`
                      : integrationStatus === "disconnected"
                      ? "Nenhum provedor configurado"
                      : "Clique para verificar"}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={checkIntegration} disabled={checkingStatus}>
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${checkingStatus ? "animate-spin" : ""}`} />
                Verificar
              </Button>
            </div>

            {/* Quick stats */}
            {!loadingLogs && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-green-500/5 border border-green-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-green-600">{stats.sent}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Enviados</p>
                </div>
                <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pendentes</p>
                </div>
                <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-red-600">{stats.failed}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Falhas</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Enable/Disable Toggle */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Envios automáticos via WhatsApp</p>
                  <p className="text-xs text-muted-foreground">
                    Confirmações, lembretes e notificações
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {savingToggle && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                <Switch
                  checked={whatsappEnabled}
                  onCheckedChange={handleToggleWhatsapp}
                  disabled={savingToggle}
                />
              </div>
            </div>

            {!whatsappEnabled && (
              <div className="mt-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10 p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  Com os envios desativados, nenhuma mensagem WhatsApp será enviada automaticamente. Você ainda pode enviar mensagens manuais pelo teste abaixo.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Test Panel */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" />
              Teste Manual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Telefone (com DDD)</Label>
              <Input
                placeholder="11999999999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Mensagem</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="mt-1 resize-none"
              />
            </div>
            <Button onClick={handleSendTest} disabled={sending || !phone.trim()} className="w-full gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar teste
            </Button>

            {testResult && (
              <div
                className={`rounded-lg p-3 text-sm flex items-start gap-2 ${
                  testResult.success
                    ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300"
                    : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                )}
                <div>
                  {testResult.success ? (
                    <p>
                      Mensagem enviada! ID: <code className="text-xs">{testResult.messageId}</code>
                      {testResult.provider && (
                        <span className="text-xs ml-1 opacity-70">via {testResult.provider}</span>
                      )}
                    </p>
                  ) : (
                    <p>Falha: {testResult.error}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Logs */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Últimas Mensagens
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={fetchLogs} disabled={loadingLogs}>
                <RefreshCw className={`h-3.5 w-3.5 ${loadingLogs ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingLogs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : logs.length === 0 ? (
              <div className="flex items-center justify-center py-8 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-sm text-muted-foreground">Nenhuma mensagem WhatsApp enviada ainda.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between p-3 rounded-xl border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusColors[log.status] || ""}`}>
                          {log.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {typeLabels[log.type] || log.type}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-foreground truncate">
                        {log.recipient_name || log.recipient_phone || "—"}
                      </p>
                      {log.body && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{log.body}</p>
                      )}
                      {log.error_message && (
                        <p className="text-[11px] text-red-500 mt-0.5 truncate">{log.error_message}</p>
                      )}
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p className="text-[10px] text-muted-foreground">
                        {log.sent_at
                          ? new Date(log.sent_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
                          : log.scheduled_for
                          ? `Agendado: ${new Date(log.scheduled_for).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
