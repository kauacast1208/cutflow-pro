import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, Edit2, Users, Building2, UserCog, Package, Briefcase, Infinity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { featureLabels, type PlanFeature } from "@/lib/plans";

interface Plan {
  id: string;
  slug: string;
  label: string;
  price: number;
  max_professionals: number;
  max_units: number;
  max_users: number;
  max_clients: number;
  max_services: number;
  features: string[];
  is_active: boolean;
  billing_cycle: string;
  trial_days: number;
  description: string | null;
}

const allFeatures: PlanFeature[] = [
  "agenda", "clients", "services", "basic_reports", "advanced_reports",
  "finance", "blocked_times", "simple_campaigns", "advanced_campaigns",
  "basic_mailing", "mailing", "marketing_automation", "priority_support",
  "chat_support", "integrations", "crm_enabled", "automations", "custom_branding",
  "multi_unit_enabled",
];

const limitConfig = [
  { key: "max_professionals", label: "Profissionais", icon: UserCog },
  { key: "max_units", label: "Unidades", icon: Building2 },
  { key: "max_users", label: "Usuários", icon: Users },
  { key: "max_clients", label: "Clientes", icon: Package },
  { key: "max_services", label: "Serviços", icon: Briefcase },
] as const;

export default function MasterPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchPlans = async () => {
    const { data } = await supabase.from("plans").select("*").order("price");
    setPlans((data as unknown as Plan[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleSave = async () => {
    if (!editPlan) return;
    setSaving(true);
    const { error } = await supabase
      .from("plans")
      .update({
        label: editPlan.label,
        price: editPlan.price,
        max_professionals: editPlan.max_professionals,
        max_units: editPlan.max_units,
        max_users: editPlan.max_users,
        max_clients: editPlan.max_clients,
        max_services: editPlan.max_services,
        features: editPlan.features,
        is_active: editPlan.is_active,
        trial_days: editPlan.trial_days,
        description: editPlan.description,
      })
      .eq("id", editPlan.id);

    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Plano atualizado" });
      setEditPlan(null);
      fetchPlans();
    }
  };

  const toggleFeature = (feature: string) => {
    if (!editPlan) return;
    const features = editPlan.features.includes(feature)
      ? editPlan.features.filter((f) => f !== feature)
      : [...editPlan.features, feature];
    setEditPlan({ ...editPlan, features });
  };

  const formatLimit = (val: number) => val >= 999 ? "∞" : val.toString();

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Planos</h1>
        <p className="text-muted-foreground text-sm">Gerencie os planos e limites da plataforma CutFlow.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={`flex flex-col relative ${!plan.is_active ? "opacity-50" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.label}</CardTitle>
                <div className="flex items-center gap-1.5">
                  {!plan.is_active && (
                    <Badge variant="outline" className="text-[9px]">Inativo</Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px] uppercase font-mono">{plan.slug}</Badge>
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">
                R$ {plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                <span className="text-sm font-normal text-muted-foreground">/mês</span>
              </div>
              {plan.description && (
                <p className="text-xs text-muted-foreground">{plan.description}</p>
              )}
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {/* Limits */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Limites</p>
                <div className="grid grid-cols-2 gap-1">
                  {limitConfig.map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon className="h-3 w-3 shrink-0" />
                      <span>{formatLimit((plan as any)[key])} {label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recursos</p>
                <ul className="space-y-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {featureLabels[f as PlanFeature] || f}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => setEditPlan({ ...plan })}
              >
                <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                Editar plano
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editPlan} onOpenChange={(o) => !o && setEditPlan(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar plano — {editPlan?.label}</DialogTitle>
          </DialogHeader>
          {editPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nome</Label>
                  <Input value={editPlan.label} onChange={(e) => setEditPlan({ ...editPlan, label: e.target.value })} />
                </div>
                <div>
                  <Label>Preço (R$)</Label>
                  <Input type="number" value={editPlan.price} onChange={(e) => setEditPlan({ ...editPlan, price: Number(e.target.value) })} />
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea value={editPlan.description || ""} onChange={(e) => setEditPlan({ ...editPlan, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Dias de trial</Label>
                  <Input type="number" value={editPlan.trial_days} onChange={(e) => setEditPlan({ ...editPlan, trial_days: Number(e.target.value) })} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={editPlan.is_active} onCheckedChange={(v) => setEditPlan({ ...editPlan, is_active: v })} />
                  <Label>Ativo</Label>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Limites</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {limitConfig.map(({ key, label }) => (
                    <div key={key}>
                      <Label className="text-xs">{label}</Label>
                      <Input
                        type="number"
                        value={(editPlan as any)[key]}
                        onChange={(e) => setEditPlan({ ...editPlan, [key]: Number(e.target.value) })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Recursos</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {allFeatures.map((feature) => (
                    <label key={feature} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editPlan.features.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="rounded"
                      />
                      {featureLabels[feature] || feature}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlan(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
