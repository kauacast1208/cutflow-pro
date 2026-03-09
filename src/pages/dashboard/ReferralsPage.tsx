import { useState, useEffect } from "react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Gift, Users, Copy, Share2, Trophy, Loader2, Save, Star,
} from "lucide-react";

export default function ReferralsPage() {
  const { barbershop, setBarbershop } = useBarbershop();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [goal, setGoal] = useState(5);
  const [reward, setReward] = useState("Corte grátis");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    if (!barbershop) return;
    setEnabled((barbershop as any).referral_enabled ?? false);
    setGoal((barbershop as any).referral_goal ?? 5);
    setReward((barbershop as any).referral_reward ?? "Corte grátis");

    Promise.all([
      supabase.from("referrals").select("*, referrer:referrer_client_id(name), referred:referred_client_id(name)")
        .eq("barbershop_id", barbershop.id).order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name").eq("barbershop_id", barbershop.id).order("name"),
    ]).then(([refRes, clientRes]) => {
      setReferrals(refRes.data || []);
      setClients(clientRes.data || []);
      setLoading(false);
    });
  }, [barbershop]);

  const saveSettings = async () => {
    if (!barbershop) return;
    setSaving(true);
    const { data, error } = await supabase.from("barbershops").update({
      referral_enabled: enabled,
      referral_goal: goal,
      referral_reward: reward,
    } as any).eq("id", barbershop.id).select().single();
    setSaving(false);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setBarbershop(data);
      toast({ title: "Configurações salvas!" });
    }
  };

  // Group referrals by referrer
  const referrerStats = referrals.reduce((acc: Record<string, { name: string; count: number; completed: number }>, r: any) => {
    const id = r.referrer_client_id;
    if (!acc[id]) {
      acc[id] = { name: r.referrer?.name || "—", count: 0, completed: 0 };
    }
    acc[id].count++;
    if (r.status === "completed") acc[id].completed++;
    return acc;
  }, {});

  const topReferrers = Object.entries(referrerStats)
    .map(([id, stats]: [string, any]) => ({ id, ...stats }))
    .sort((a, b) => b.count - a.count);

  const referralLink = barbershop
    ? `${window.location.origin}/b/${barbershop.slug}?ref=CLIENTE`
    : "";

  if (!barbershop) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">Indicações</h2>
        <p className="text-muted-foreground text-sm">Configure o programa de indicação da sua barbearia.</p>
      </div>

      {/* Settings */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Programa de indicação</h3>
              <p className="text-xs text-muted-foreground">Clientes indicam amigos e ganham recompensas</p>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <div className="space-y-4 pt-2 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Meta de indicações</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={goal}
                  onChange={(e) => setGoal(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Número de indicações para desbloquear a recompensa</p>
              </div>
              <div className="space-y-2">
                <Label>Recompensa</Label>
                <Input
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="Ex: Corte grátis, 20% desconto"
                />
                <p className="text-xs text-muted-foreground">Benefício que o cliente recebe ao atingir a meta</p>
              </div>
            </div>

            {/* Referral link example */}
            <div className="bg-accent/50 rounded-lg p-4 space-y-2">
              <Label className="text-xs text-muted-foreground">Exemplo de link de indicação</Label>
              <div className="flex items-center gap-2">
                <Input value={referralLink} readOnly className="text-xs bg-card" />
                <Button size="sm" variant="outline" onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  toast({ title: "Link copiado!" });
                }}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Cada cliente terá seu link personalizado</p>
            </div>

            <Button size="sm" onClick={saveSettings} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Salvar configurações
            </Button>
          </div>
        )}

        {!enabled && (
          <Button size="sm" onClick={saveSettings} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            Salvar
          </Button>
        )}
      </div>

      {/* How it works */}
      {enabled && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-semibold mb-4">Como funciona</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Cliente indica", desc: "Compartilha o link com amigos" },
              { step: "2", title: "Amigo agenda", desc: "O amigo indicado faz um agendamento" },
              { step: `3`, title: "Recompensa!", desc: `Ao completar ${goal} indicações, ganha: ${reward}` },
            ].map((s) => (
              <div key={s.step} className="text-center p-4 rounded-lg bg-accent/30">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary font-bold text-sm">
                  {s.step}
                </div>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Referrers */}
      {enabled && topReferrers.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-warning" />
            <h3 className="font-semibold">Top indicadores</h3>
          </div>
          <div className="space-y-3">
            {topReferrers.slice(0, 10).map((r, i) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <span className="text-sm font-bold w-8 text-center shrink-0 text-muted-foreground">
                  {i < 3 ? ["1º", "2º", "3º"][i] : `${i + 1}º`}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.count} indicações · {r.completed} confirmadas</p>
                </div>
                {r.count >= goal && (
                  <Badge className="bg-success/10 text-success border-success/20 text-[10px]">
                    <Star className="h-3 w-3 mr-1" /> Recompensa desbloqueada
                  </Badge>
                )}
                <div className="w-24">
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min((r.count / goal) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-right mt-1">{r.count}/{goal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {enabled && topReferrers.length === 0 && !loading && (
        <div className="rounded-xl border border-border bg-card p-8 shadow-card text-center text-muted-foreground">
          <Share2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">Nenhuma indicação ainda</p>
          <p className="text-xs mt-1">Compartilhe o link com seus clientes para começar.</p>
        </div>
      )}
    </div>
  );
}
