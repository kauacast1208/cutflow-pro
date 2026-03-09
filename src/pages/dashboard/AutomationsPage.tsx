import { useState, useEffect } from "react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, CalendarHeart, UserX, Star, Gift, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import AutomationCard, { type Automation, type AutomationType } from "@/components/automations/AutomationCard";
import NotificationsPanel from "@/components/automations/NotificationsPanel";

const automationTypes: AutomationType[] = [
  {
    type: "birthday",
    title: "Aniversário",
    description: "Envia mensagem automática no aniversário do cliente",
    icon: CalendarHeart,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    iconBg: "bg-gradient-to-br from-pink-500/10 to-pink-500/5",
    defaultConfig: {
      message: "Feliz aniversário, {{nome}}!\n\nPara comemorar, temos um presente especial para você. Agende seu horário!\n\n{{link}}",
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
      message: "Olá {{nome}}, sentimos sua falta!\n\nJá faz um tempo que você não nos visita. Que tal agendar um horário?\n\n{{link}}",
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
      message: "Olá {{nome}}!\n\nObrigado pela visita hoje! Esperamos que tenha gostado do resultado.\n\nNos vemos em breve!",
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
      message: "Parabéns {{nome}}!\n\nVocê completou {{meta}} indicações e ganhou: {{recompensa}}!\n\nAgende seu horário para resgatar: {{link}}",
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

  useEffect(() => {
    if (!barbershop) return;
    Promise.all([
      supabase.from("automations").select("*").eq("barbershop_id", barbershop.id),
      supabase.from("notifications").select("*").eq("barbershop_id", barbershop.id).order("created_at", { ascending: false }).limit(100),
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
      const { data } = await supabase.from("automations").insert({
        barbershop_id: barbershop.id, type, enabled: newEnabled, config: def?.defaultConfig || {},
      } as any).select().single();
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
      const { data } = await supabase.from("automations").insert({
        barbershop_id: barbershop.id, type, enabled: current.enabled, config: current.config,
      } as any).select().single();
      if (data) {
        const map = new Map(automations);
        map.set(type, data as any);
        setAutomations(map);
      }
    }

    setSaving(null);
    toast({ title: "Configuração salva!" });
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
                  Configure mensagens automáticas para engajar seus clientes
                </p>
              </div>
            </div>
          </div>
          {activeCount > 0 && (
            <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-full">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{activeCount} ativa{activeCount > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Automation Cards */}
      <div className="space-y-3">
        {automationTypes.map((at) => (
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
            <h3 className="font-semibold text-foreground">Como funcionam</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Três passos simples</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Configure", desc: "Ative e personalize a mensagem de cada automação", emoji: "" },
            { step: "2", title: "Automático", desc: "O sistema detecta o evento e prepara o envio", emoji: "" },
            { step: "3", title: "Envio", desc: "A mensagem é enviada pelo canal escolhido", emoji: "" },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="relative text-center p-5 rounded-xl bg-secondary/30 border border-border/30"
            >
              <div className="text-2xl mb-3">{s.emoji}</div>
              <p className="text-sm font-semibold text-foreground">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <NotificationsPanel notifications={notifications} />
    </div>
  );
}
