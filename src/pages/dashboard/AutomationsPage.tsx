import { useState, useEffect, useCallback } from "react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Zap, CalendarHeart, UserX, Star, Gift, Sparkles,
  Bell, Clock, MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import AutomationCard, { type Automation, type AutomationType } from "@/components/automations/AutomationCard";
import NotificationsPanel from "@/components/automations/NotificationsPanel";

const automationTypes: AutomationType[] = [
  {
    type: "appointment_reminder_24h",
    title: "Lembrete 24h antes",
    description: "Envia lembrete via WhatsApp 24 horas antes do agendamento",
    icon: Bell,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    iconBg: "bg-gradient-to-br from-blue-500/10 to-blue-500/5",
    defaultConfig: {
      message:
        "Olá, {{client_name}}! Este é um lembrete do seu agendamento na {{barbershop_name}}.\n\nServiço: {{service_name}}\nProfissional: {{professional_name}}\nData: {{appointment_date}}\nHorário: {{appointment_time}}\n\nSe precisar reagendar, entre em contato conosco.",
      channel: "whatsapp",
    },
  },
  {
    type: "appointment_reminder_2h",
    title: "Lembrete 2h antes",
    description: "Envia lembrete via WhatsApp 2 horas antes do agendamento",
    icon: Clock,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    iconBg: "bg-gradient-to-br from-indigo-500/10 to-indigo-500/5",
    defaultConfig: {
      message:
        "Olá, {{client_name}}! Faltam 2 horas para o seu horário na {{barbershop_name}}.\n\nServiço: {{service_name}}\nHorário: {{appointment_time}}\n\nTe esperamos!",
      channel: "whatsapp",
    },
  },
  {
    type: "birthday",
    title: "Aniversário",
    description: "Envia mensagem automática no aniversário do cliente",
    icon: CalendarHeart,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    iconBg: "bg-gradient-to-br from-pink-500/10 to-pink-500/5",
    defaultConfig: {
      message:
        "Feliz aniversário, {{nome}}!\n\nPara comemorar, temos um presente especial para você. Agende seu horário!\n\n{{link}}",
      channel: "whatsapp",
    },
  },
  {
    type: "inactive_client",
    title: "Cliente inativo",
    description: "Envia mensagem quando o cliente não agenda há X dias",
    icon: UserX,
    color: "text-warning",
    bg: "bg-warning/10",
    iconBg: "bg-gradient-to-br from-warning/10 to-warning/5",
    defaultConfig: {
      message:
        "Olá {{nome}}, sentimos sua falta!\n\nJá faz um tempo que você não nos visita. Que tal agendar um horário?\n\n{{link}}",
      channel: "whatsapp",
      days_threshold: 30,
    },
  },
  {
    type: "post_service",
    title: "Pós-atendimento",
    description: "Envia mensagem de agradecimento após o atendimento",
    icon: Star,
    color: "text-primary",
    bg: "bg-primary/10",
    iconBg: "bg-gradient-to-br from-primary/10 to-primary/5",
    defaultConfig: {
      message:
        "Olá {{nome}}!\n\nObrigado pela visita hoje! Esperamos que tenha gostado do resultado.\n\nNos vemos em breve!",
      channel: "whatsapp",
      delay_hours: 2,
    },
  },
  {
    type: "referral_reward",
    title: "Indicação de amigos",
    description: "Notifica quando o cliente atinge a meta de indicações",
    icon: Gift,
    color: "text-success",
    bg: "bg-success/10",
    iconBg: "bg-gradient-to-br from-success/10 to-success/5",
    defaultConfig: {
      message:
        "Parabéns {{nome}}!\n\nVocê completou {{meta}} indicações e ganhou: {{recompensa}}!\n\nAgende seu horário para resgatar: {{link}}",
      channel: "whatsapp",
    },
  },
];

export default function AutomationsPage() {
  const { barbershop } = useBarbershop();
  const { toast } = useToast();
  const [automations, setAutomations] = useState<Map<string, Automation>>(new Map());
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!barbershop) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("barbershop_id", barbershop.id)
      .order("created_at", { ascending: false })
      .limit(200);
    setNotifications(data || []);
  }, [barbershop]);

  useEffect(() => {
    if (!barbershop) return;
    Promise.all([
      supabase.from("automations").select("*").eq("barbershop_id", barbershop.id),
      supabase
        .from("notifications")
        .select("*")
        .eq("barbershop_id", barbershop.id)
        .order("created_at", { ascending: false })
        .limit(200),
    ]).then(([autoRes, notifRes]) => {
      const map = new Map<string, Automation>();
      (autoRes.data || []).forEach((a: any) => map.set(a.type, a));
      setAutomations(map);
      setNotifications(notifRes.data || []);
      setLoading(false);
    });
  }, [barbershop]);

  const getAutomation = (type: string): Automation => {
    const existing = automations.get(type);
    if (existing) return existing;
    const def = automationTypes.find((a) => a.type === type);
    return { type, enabled: false, config: def?.defaultConfig || {} };
  };

  const toggleAutomation = async (type: string) => {
    if (!barbershop) return;
    const current = getAutomation(type);
    const newEnabled = !current.enabled;
    setSaving(type);
    const def = automationTypes.find((a) => a.type === type);

    if (current.id) {
      await supabase.from("automations").update({ enabled: newEnabled } as any).eq("id", current.id);
    } else {
      const { data } = await supabase
        .from("automations")
        .insert({
          barbershop_id: barbershop.id,
          type,
          enabled: newEnabled,
          config: def?.defaultConfig || {},
        } as any)
        .select()
        .single();
      if (data) {
        const map = new Map(automations);
        map.set(type, data as any);
        setAutomations(map);
      }
    }

    const map = new Map(automations);
    map.set(type, { ...current, enabled: newEnabled });
    setAutomations(map);
    setSaving(null);
    toast({ title: newEnabled ? "Automação ativada!" : "Automação desativada" });
  };

  const updateConfig = (type: string, key: string, value: any) => {
    const current = getAutomation(type);
    const map = new Map(automations);
    map.set(type, { ...current, config: { ...current.config, [key]: value } });
    setAutomations(map);
  };

  const saveConfig = async (type: string) => {
    if (!barbershop) return;
    const current = getAutomation(type);
    setSaving(type);

    if (current.id) {
      await supabase.from("automations").update({ config: current.config } as any).eq("id", current.id);
    } else {
      const { data } = await supabase
        .from("automations")
        .insert({
          barbershop_id: barbershop.id,
          type,
          enabled: current.enabled,
          config: current.config,
        } as any)
        .select()
        .single();
      if (data) {
        const map = new Map(automations);
        map.set(type, data as any);
        setAutomations(map);
      }
    }

    setSaving(null);
    toast({ title: "Configuração salva!" });
  };

  const handleResend = async (notificationId: string) => {
    // Reset notification to pending so process-reminders picks it up
    await supabase
      .from("notifications")
      .update({ status: "pending", error_message: null, sent_at: null, scheduled_for: new Date().toISOString() } as any)
      .eq("id", notificationId);
    toast({ title: "Notificação reagendada para reenvio" });
    await fetchNotifications();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando automações...</p>
        </div>
      </div>
    );
  }

  const activeCount = automationTypes.filter((at) => getAutomation(at.type).enabled).length;

  // Separate reminder automations from marketing ones
  const reminderTypes = automationTypes.filter((at) =>
    at.type === "appointment_reminder_24h" || at.type === "appointment_reminder_2h"
  );
  const marketingTypes = automationTypes.filter(
    (at) => at.type !== "appointment_reminder_24h" && at.type !== "appointment_reminder_2h"
  );

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Automações</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Configure lembretes e mensagens automáticas para seus clientes
                </p>
              </div>
            </div>
          </div>
          {activeCount > 0 && (
            <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-full">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {activeCount} ativa{activeCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Reminder Section */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex items-center gap-2.5 mb-3">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-foreground">Lembretes de Agendamento</h3>
          <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-medium">
            WhatsApp
          </span>
        </div>
        <div className="space-y-3">
          {reminderTypes.map((at) => (
            <AutomationCard
              key={at.type}
              at={at}
              automation={getAutomation(at.type)}
              isExpanded={expandedType === at.type}
              saving={saving}
              onToggle={() => toggleAutomation(at.type)}
              onExpand={() => setExpandedType(expandedType === at.type ? null : at.type)}
              onUpdateConfig={(key, value) => updateConfig(at.type, key, value)}
              onSave={() => saveConfig(at.type)}
            />
          ))}
        </div>
      </motion.div>

      {/* Marketing Section */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-2.5 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Marketing & Engajamento</h3>
        </div>
        <div className="space-y-3">
          {marketingTypes.map((at) => (
            <AutomationCard
              key={at.type}
              at={at}
              automation={getAutomation(at.type)}
              isExpanded={expandedType === at.type}
              saving={saving}
              onToggle={() => toggleAutomation(at.type)}
              onExpand={() => setExpandedType(expandedType === at.type ? null : at.type)}
              onUpdateConfig={(key, value) => updateConfig(at.type, key, value)}
              onSave={() => saveConfig(at.type)}
            />
          ))}
        </div>
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-border/60 bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
            <Zap className="h-4.5 w-4.5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Como funcionam os lembretes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Fluxo automático em três passos</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Configure", desc: "Ative o lembrete e personalize a mensagem com os placeholders disponíveis" },
            { step: "2", title: "Detecção", desc: "O sistema identifica agendamentos futuros e agenda os lembretes automaticamente" },
            { step: "3", title: "Envio", desc: "A mensagem é enviada via WhatsApp no horário programado" },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="relative text-center p-5 rounded-xl bg-secondary/30 border border-border/30"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center mx-auto mb-3">
                {s.step}
              </div>
              <p className="text-sm font-semibold text-foreground">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <NotificationsPanel notifications={notifications} onResend={handleResend} />
    </div>
  );
}
