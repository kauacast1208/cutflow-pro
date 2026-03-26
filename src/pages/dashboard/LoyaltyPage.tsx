import { useEffect, useState } from "react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  DollarSign,
  Gift,
  Loader2,
  Save,
  Scissors,
  Star,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface LoyaltyProgram {
  id?: string;
  barbershop_id: string;
  enabled: boolean;
  type: string;
  target: number;
  reward_description: string;
  reward_validity_days: number;
  service_ids: string[];
  specific_service_id: string | null;
  notification_message: string;
  notification_near_message: string;
  near_threshold: number;
}

interface LoyaltyReward {
  id: string;
  client_id: string;
  progress: number;
  total_spent: number;
  target: number;
  reward_description: string;
  status: string;
  earned_at: string | null;
  redeemed_at: string | null;
  expires_at: string | null;
  created_at: string;
  clients?: { name: string; phone: string | null };
}

const typeOptions = [
  { value: "visits", label: "Por visitas", icon: Users, desc: "Ex: 10 cortes = 1 gratis" },
  { value: "spending", label: "Por valor gasto", icon: DollarSign, desc: "Ex: R$ 500 = desconto de R$ 50" },
  { value: "specific_service", label: "Por servico especifico", icon: Scissors, desc: "Ex: 10 cortes = 1 barba gratis" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  in_progress: { label: "Em progresso", color: "text-blue-600", bg: "bg-blue-500/10" },
  earned: { label: "Recompensa disponivel", color: "text-success", bg: "bg-success/10" },
  redeemed: { label: "Resgatada", color: "text-muted-foreground", bg: "bg-secondary" },
  expired: { label: "Expirada", color: "text-destructive", bg: "bg-destructive/10" },
};

function normalizeServiceIds(data: any): string[] {
  if (Array.isArray(data?.service_ids)) {
    return data.service_ids.filter((item: unknown): item is string => typeof item === "string");
  }

  if (typeof data?.specific_service_id === "string" && data.specific_service_id) {
    return [data.specific_service_id];
  }

  return [];
}

export default function LoyaltyPage() {
  const { barbershop } = useBarbershop();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [rewardFilter, setRewardFilter] = useState<string>("all");
  const [program, setProgram] = useState<LoyaltyProgram>({
    barbershop_id: "",
    enabled: false,
    type: "visits",
    target: 10,
    reward_description: "Corte gratis",
    reward_validity_days: 30,
    service_ids: [],
    specific_service_id: null,
    notification_message: "Parabens {{client_name}}! Voce ganhou {{reward}} na {{barbershop_name}}. Apresente esta recompensa no seu proximo agendamento.",
    notification_near_message: "Faltam apenas {{remaining}} para voce ganhar {{reward}} na {{barbershop_name}}!",
    near_threshold: 2,
  });

  useEffect(() => {
    if (!barbershop) return;

    Promise.all([
      supabase.from("loyalty_programs").select("*").eq("barbershop_id", barbershop.id).maybeSingle(),
      supabase.from("services").select("id, name").eq("barbershop_id", barbershop.id).eq("active", true),
      supabase.from("loyalty_rewards").select("*, clients(name, phone)")
        .eq("barbershop_id", barbershop.id).order("created_at", { ascending: false }).limit(200),
    ]).then(([progRes, svcRes, rewardRes]) => {
      if (progRes.error || svcRes.error || rewardRes.error) {
        toast({
          title: "Erro ao carregar fidelidade",
          description: progRes.error?.message || svcRes.error?.message || rewardRes.error?.message || "Tente novamente.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (progRes.data) {
        setProgram({
          ...(progRes.data as any),
          type: progRes.data.type as string,
          service_ids: normalizeServiceIds(progRes.data),
          specific_service_id: (progRes.data as any).specific_service_id || null,
        });
      } else {
        setProgram((current) => ({ ...current, barbershop_id: barbershop.id }));
      }

      setServices(svcRes.data || []);
      setRewards((rewardRes.data || []) as any);
      setLoading(false);
    }).catch((error) => {
      toast({ title: "Erro ao carregar fidelidade", description: error instanceof Error ? error.message : "Tente novamente.", variant: "destructive" });
      setLoading(false);
    });
  }, [barbershop]);

  const handleSave = async () => {
    if (!barbershop) return;

    if (program.type === "specific_service" && program.service_ids.length === 0) {
      toast({
        title: "Selecione ao menos um servico",
        description: "Escolha os servicos que devem contar para a fidelidade.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const selectedServiceIds = program.type === "specific_service" ? program.service_ids : [];
    const payload = {
      barbershop_id: barbershop.id,
      enabled: program.enabled,
      type: program.type,
      target: program.target,
      reward_description: program.reward_description,
      reward_validity_days: program.reward_validity_days,
      service_ids: selectedServiceIds.length > 0 ? selectedServiceIds : null,
      specific_service_id: selectedServiceIds[0] || null,
      notification_message: program.notification_message,
      notification_near_message: program.notification_near_message,
      near_threshold: program.near_threshold,
    };

    const persistProgram = async (allowServiceIds: boolean) => {
      const attemptPayload = {
        ...payload,
        service_ids: allowServiceIds ? payload.service_ids : null,
        specific_service_id: selectedServiceIds[0] || null,
      };

      if (program.id) {
        return await supabase.from("loyalty_programs").update(attemptPayload as any).eq("id", program.id).select().single();
      }

      return await supabase.from("loyalty_programs").insert(attemptPayload as any).select().single();
    };

    let response = await persistProgram(true);
    let savedWithFallback = false;

    if (
      response.error &&
      program.type === "specific_service" &&
      /service_ids|column/i.test(response.error.message)
    ) {
      response = await persistProgram(false);
      savedWithFallback = !response.error;
    }

    if (response.error) {
      setSaving(false);
      toast({ title: "Erro ao salvar fidelidade", description: response.error.message, variant: "destructive" });
      return;
    }

    if (response.data) {
      setProgram({
        ...(response.data as any),
        service_ids: savedWithFallback ? selectedServiceIds : normalizeServiceIds(response.data),
        specific_service_id: (response.data as any).specific_service_id || selectedServiceIds[0] || null,
      });
    }

    setSaving(false);
    toast({
      title: savedWithFallback ? "Programa salvo com fallback" : "Programa de fidelidade salvo!",
      description: savedWithFallback ? "A seleção múltipla ficou salva localmente, mas o backend aceitou apenas o serviço principal." : undefined,
    });
  };

  const toggleService = (serviceId: string) => {
    const nextIds = program.service_ids.includes(serviceId)
      ? program.service_ids.filter((id) => id !== serviceId)
      : [...program.service_ids, serviceId];

    setProgram({
      ...program,
      service_ids: nextIds,
      specific_service_id: nextIds[0] || null,
    });
  };

  const handleRedeem = async (rewardId: string) => {
    const redeemedAt = new Date().toISOString();
    const { error } = await supabase.from("loyalty_rewards").update({
      status: "redeemed",
      redeemed_at: redeemedAt,
    } as any).eq("id", rewardId);
    if (error) {
      toast({ title: "Erro ao resgatar recompensa", description: error.message, variant: "destructive" });
      return;
    }
    setRewards((prev) => prev.map((reward) =>
      reward.id === rewardId ? { ...reward, status: "redeemed", redeemed_at: redeemedAt } : reward
    ));
    toast({ title: "Recompensa marcada como resgatada!" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const activeRewards = rewards.filter((reward) => reward.status === "in_progress");
  const earnedRewards = rewards.filter((reward) => reward.status === "earned");
  const redeemedRewards = rewards.filter((reward) => reward.status === "redeemed");
  const nearTarget = activeRewards.filter((reward) => reward.target - reward.progress <= program.near_threshold);
  const filteredRewards = rewardFilter === "all"
    ? rewards
    : rewards.filter((reward) => reward.status === rewardFilter);

  return (
    <div className="space-y-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Programa de Fidelidade</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Recompense seus clientes e aumente a retencao
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={program.enabled}
              onCheckedChange={(value) => setProgram({ ...program, enabled: value })}
            />
            <span className="text-xs text-muted-foreground">{program.enabled ? "Ativo" : "Inativo"}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: "Participando", value: activeRewards.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Recompensas disponiveis", value: earnedRewards.length, icon: Gift, color: "text-success", bg: "bg-success/10" },
          { label: "Resgatadas", value: redeemedRewards.length, icon: CheckCircle2, color: "text-muted-foreground", bg: "bg-secondary" },
          { label: "Perto da meta", value: nearTarget.length, icon: TrendingUp, color: "text-warning", bg: "bg-warning/10" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border/60 bg-card p-4">
            <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {(nearTarget.length > 0 || earnedRewards.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="space-y-2"
        >
          {nearTarget.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-warning/5 border border-warning/20 p-3">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
              <p className="text-sm text-foreground">
                <strong>{nearTarget.length}</strong> cliente{nearTarget.length > 1 ? "s" : ""} {nearTarget.length > 1 ? "estao" : "esta"} perto de ganhar recompensa
              </p>
            </div>
          )}
          {earnedRewards.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-success/5 border border-success/20 p-3">
              <Gift className="h-4 w-4 text-success shrink-0" />
              <p className="text-sm text-foreground">
                <strong>{earnedRewards.length}</strong> recompensa{earnedRewards.length > 1 ? "s" : ""} aguardando resgate
              </p>
            </div>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-border/60 bg-card p-6 space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
            <Star className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Configuracao do programa</h3>
            <p className="text-xs text-muted-foreground">Defina o tipo de fidelidade e a recompensa</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tipo de fidelidade
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setProgram({ ...program, type: option.value })}
                className={`flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left ${
                  program.type === option.value
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/60 bg-card hover:border-border"
                }`}
              >
                <option.icon className={`h-5 w-5 ${program.type === option.value ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{option.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{option.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {program.type === "spending" ? "Valor necessario (R$)" : "Quantidade necessaria"}
            </Label>
            <Input
              type="number"
              min={1}
              value={program.target}
              onChange={(e) => setProgram({ ...program, target: Number(e.target.value) })}
              className="bg-card border-border/60"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recompensa
            </Label>
            <Input
              value={program.reward_description}
              onChange={(e) => setProgram({ ...program, reward_description: e.target.value })}
              placeholder="Ex: 1 corte gratis"
              className="bg-card border-border/60"
            />
          </div>
        </div>

        {program.type === "specific_service" && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Servicos contabilizados
            </Label>
            <div className="space-y-2 rounded-xl border border-border/60 bg-card p-3">
              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum servico ativo disponivel.</p>
              ) : (
                services.map((service) => {
                  const checked = program.service_ids.includes(service.id);
                  return (
                    <label
                      key={service.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 transition-all ${
                        checked ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleService(service.id)}
                          className="h-4 w-4 rounded border-border"
                        />
                        <span className="text-sm text-foreground">{service.name}</span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            <p className="text-[11px] text-muted-foreground/70">
              Os atendimentos concluidos em qualquer servico marcado contam para a meta.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Validade da recompensa (dias)
            </Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={program.reward_validity_days}
              onChange={(e) => setProgram({ ...program, reward_validity_days: Number(e.target.value) })}
              className="w-28 bg-card border-border/60"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notificar quando faltar
            </Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={program.near_threshold}
              onChange={(e) => setProgram({ ...program, near_threshold: Number(e.target.value) })}
              className="w-28 bg-card border-border/60"
            />
            <p className="text-[11px] text-muted-foreground/70">
              Enviar mensagem quando faltar essa quantidade para a meta
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mensagem ao atingir meta
            </Label>
            <Textarea
              rows={3}
              value={program.notification_message}
              onChange={(e) => setProgram({ ...program, notification_message: e.target.value })}
              className="text-sm bg-card border-border/60 resize-none"
            />
            <p className="text-[11px] text-muted-foreground/70">
              Variaveis: <code className="text-primary/80 bg-primary/5 px-1 rounded">{"{{client_name}}"}</code>,{" "}
              <code className="text-primary/80 bg-primary/5 px-1 rounded">{"{{reward}}"}</code>,{" "}
              <code className="text-primary/80 bg-primary/5 px-1 rounded">{"{{barbershop_name}}"}</code>
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mensagem "quase la"
            </Label>
            <Textarea
              rows={2}
              value={program.notification_near_message}
              onChange={(e) => setProgram({ ...program, notification_near_message: e.target.value })}
              className="text-sm bg-card border-border/60 resize-none"
            />
            <p className="text-[11px] text-muted-foreground/70">
              Variaveis: <code className="text-primary/80 bg-primary/5 px-1 rounded">{"{{client_name}}"}</code>,{" "}
              <code className="text-primary/80 bg-primary/5 px-1 rounded">{"{{remaining}}"}</code>,{" "}
              <code className="text-primary/80 bg-primary/5 px-1 rounded">{"{{reward}}"}</code>,{" "}
              <code className="text-primary/80 bg-primary/5 px-1 rounded">{"{{barbershop_name}}"}</code>
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar programa
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-border/60 bg-card overflow-hidden"
      >
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Cartoes de Fidelidade</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Progresso dos clientes</p>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { key: "all", label: "Todos" },
                { key: "in_progress", label: "Em progresso" },
                { key: "earned", label: "Disponiveis" },
                { key: "redeemed", label: "Resgatadas" },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  size="sm"
                  variant={rewardFilter === filter.key ? "default" : "ghost"}
                  className="text-xs h-7 px-2.5"
                  onClick={() => setRewardFilter(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-2 max-h-[500px] overflow-y-auto">
          {filteredRewards.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Nenhum cartao de fidelidade</p>
              <p className="text-xs mt-1 opacity-60">
                Os cartoes serao criados automaticamente quando clientes completarem atendimentos
              </p>
            </div>
          ) : (
            filteredRewards.map((reward, index) => {
              const config = statusConfig[reward.status] || statusConfig.in_progress;
              const percent = Math.min(100, (reward.progress / reward.target) * 100);

              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card hover:border-border/70 transition-all"
                >
                  <div className={`h-10 w-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                    <Trophy className={`h-4.5 w-4.5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">
                        {(reward as any).clients?.name || "Cliente"}
                      </p>
                      <Badge variant="secondary" className={`text-[10px] border-0 ${config.bg} ${config.color}`}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Progress value={percent} className="flex-1 h-2" />
                      <span className="text-xs font-semibold text-foreground shrink-0">
                        {reward.progress}/{reward.target}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {`🎁 ${reward.reward_description}`}
                      {reward.expires_at && (
                        <span className="ml-2 opacity-60">
                          Expira: {new Date(reward.expires_at).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </p>
                  </div>
                  {reward.status === "earned" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1 shrink-0"
                      onClick={() => handleRedeem(reward.id)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resgatar
                    </Button>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
