import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Search, UserCog, Save, Clock, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { motion } from "framer-motion";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function ProfessionalsPage() {
  const { barbershop } = useBarbershop();
  const { toast } = useToast();
  const { limit, isAtLimit, showUpgrade, planLabel } = usePlanPermissions();
  const [pros, setPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Barbeiro");
  const [specialties, setSpecialties] = useState("");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("19:00");
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!barbershop) return;
    setLoading(true);
    const { data } = await supabase.from("professionals").select("*").eq("barbershop_id", barbershop.id).order("name");
    setPros(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [barbershop]);

  const openNew = () => {
    const activePros = pros.filter((p) => p.active !== false).length;
    if (isAtLimit("professionals", activePros)) {
      showUpgrade("agenda");
      toast({ title: "Limite atingido", description: `Plano ${planLabel} permite até ${limit("professionals")} profissional(is).`, variant: "destructive" });
      return;
    }
    setEditing(null); setName(""); setRole("Barbeiro"); setSpecialties("");
    setWorkStart("09:00"); setWorkEnd("19:00"); setWorkDays([1, 2, 3, 4, 5, 6]);
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p); setName(p.name); setRole(p.role || "Barbeiro");
    setSpecialties((p.specialties || []).join(", "));
    setWorkStart(p.work_start?.slice(0, 5) || "09:00");
    setWorkEnd(p.work_end?.slice(0, 5) || "19:00");
    setWorkDays(p.work_days || [1, 2, 3, 4, 5, 6]);
    setDialogOpen(true);
  };

  const toggleDay = (day: number) => setWorkDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort());

  const handleSave = async () => {
    if (!barbershop || !name.trim()) return;
    setSaving(true);
    const payload = { name, role, specialties: specialties.split(",").map((s) => s.trim()).filter(Boolean), work_start: workStart, work_end: workEnd, work_days: workDays };
    if (editing) {
      await supabase.from("professionals").update(payload).eq("id", editing.id);
      toast({ title: "Profissional atualizado!" });
    } else {
      await supabase.from("professionals").insert({ ...payload, barbershop_id: barbershop.id });
      toast({ title: "Profissional adicionado!" });
    }
    setSaving(false); setDialogOpen(false); load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("professionals").delete().eq("id", id);
    toast({ title: "Profissional removido." }); load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("professionals").update({ active: !active }).eq("id", id); load();
  };

  const filtered = pros.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  if (!barbershop) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <UserCog className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Profissionais</h2>
            <p className="text-sm text-muted-foreground">
              {pros.filter(p => p.active !== false).length}/{limit("professionals") === Infinity ? "∞" : limit("professionals")} ativos
            </p>
          </div>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5 rounded-lg">
          <Plus className="h-4 w-4" /> Novo profissional
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input placeholder="Buscar profissional..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border/60" />
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-secondary/60 flex items-center justify-center mx-auto mb-4">
            <UserCog className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Nenhum profissional cadastrado</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Adicione profissionais para permitir agendamentos.</p>
          <Button size="sm" className="mt-4 gap-1.5 rounded-lg" onClick={openNew}>
            <Plus className="h-4 w-4" /> Adicionar profissional
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`group rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-[var(--shadow-md)] cursor-pointer ${!p.active ? "opacity-50" : ""}`}
              onClick={() => openEdit(p)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold text-sm shrink-0 transition-transform group-hover:scale-105">
                    {p.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.role || "Barbeiro"}</p>
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <Switch checked={p.active} onCheckedChange={() => toggleActive(p.id, p.active)} />
                </div>
              </div>

              {p.specialties && p.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.specialties.slice(0, 3).map((s: string) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">{s}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.work_start?.slice(0, 5) || "09:00"} - {p.work_end?.slice(0, 5) || "19:00"}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{(p.work_days || []).length} dias</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar profissional" : "Novo profissional"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" className="bg-card" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Função</Label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Barbeiro" className="bg-card" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Especialidades</Label>
              <Input value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="Corte, Barba, Pigmentação" className="bg-card" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Início</Label>
                <Input type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} className="bg-card" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fim</Label>
                <Input type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} className="bg-card" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dias de trabalho</Label>
              <div className="flex gap-1.5">
                {WEEKDAYS.map((d, i) => (
                  <button key={i} type="button" onClick={() => toggleDay(i)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${workDays.includes(i) ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary/60 text-muted-foreground hover:bg-secondary"}`}
                  >{d}</button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            {editing && (
              <Button variant="destructive" size="sm" className="gap-1.5 rounded-lg" onClick={() => { handleDelete(editing.id); setDialogOpen(false); }}>
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()} className="gap-1.5 rounded-lg">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editing ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
