import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Search, UserCog, Save, Clock, Calendar, Coffee, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const BREAK_TYPES = [
  { value: "lunch", label: "Almoço", icon: "🍽", allDay: false },
  { value: "personal", label: "Pessoal", icon: "👤", allDay: false },
  { value: "unavailable", label: "Indisponível", icon: "🚫", allDay: false },
  { value: "vacation", label: "Férias / Folga", icon: "🏖", allDay: true },
] as const;

type BreakType = typeof BREAK_TYPES[number]["value"];

interface ScheduleBreak {
  id?: string;
  reason: string;
  type: BreakType;
  start_time: string;
  end_time: string;
  recurring: boolean;
  recurring_days: number[];
  all_day: boolean;
  note?: string;
}

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

  // Break management
  const [breaks, setBreaks] = useState<ScheduleBreak[]>([]);
  const [breaksLoading, setBreaksLoading] = useState(false);
  const [newBreakType, setNewBreakType] = useState<BreakType>("lunch");
  const [newBreakStart, setNewBreakStart] = useState("12:00");
  const [newBreakEnd, setNewBreakEnd] = useState("13:00");
  const [newBreakDays, setNewBreakDays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [newBreakNote, setNewBreakNote] = useState("");

  const load = async () => {
    if (!barbershop) return;
    setLoading(true);
    const { data } = await supabase.from("professionals").select("*").eq("barbershop_id", barbershop.id).order("name");
    setPros(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [barbershop]);

  const loadBreaks = useCallback(async (proId: string) => {
    if (!barbershop) return;
    setBreaksLoading(true);
    const { data } = await supabase
      .from("blocked_times")
      .select("*")
      .eq("barbershop_id", barbershop.id)
      .eq("professional_id", proId)
      .eq("recurring", true);
    const mapped: ScheduleBreak[] = (data || []).map((b: any) => ({
      id: b.id,
      reason: b.reason || "Pausa",
      type: b.all_day ? "vacation" as BreakType
        : b.reason?.toLowerCase().includes("almoço") || b.reason?.toLowerCase().includes("lunch") ? "lunch" as BreakType
        : b.reason?.toLowerCase().includes("pessoal") || b.reason?.toLowerCase().includes("personal") ? "personal" as BreakType
        : "unavailable" as BreakType,
      start_time: b.start_time?.slice(0, 5) || "12:00",
      end_time: b.end_time?.slice(0, 5) || "13:00",
      recurring: true,
      recurring_days: b.recurring_days || [],
      all_day: b.all_day || false,
      note: b.reason || "",
    }));
    setBreaks(mapped);
    setBreaksLoading(false);
  }, [barbershop]);

  const openNew = () => {
    const activePros = pros.filter((p) => p.active !== false).length;
    if (isAtLimit("professionals", activePros)) {
      showUpgrade("agenda");
      toast({ title: "Limite atingido", description: `Plano ${planLabel} permite até ${limit("professionals")} profissional(is).`, variant: "destructive" });
      return;
    }
    setEditing(null); setName(""); setRole("Barbeiro"); setSpecialties("");
    setWorkStart("09:00"); setWorkEnd("19:00"); setWorkDays([1, 2, 3, 4, 5, 6]);
    setBreaks([]);
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p); setName(p.name); setRole(p.role || "Barbeiro");
    setSpecialties((p.specialties || []).join(", "));
    setWorkStart(p.work_start?.slice(0, 5) || "09:00");
    setWorkEnd(p.work_end?.slice(0, 5) || "19:00");
    setWorkDays(p.work_days || [1, 2, 3, 4, 5, 6]);
    loadBreaks(p.id);
    setDialogOpen(true);
  };

  const toggleDay = (day: number) => setWorkDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort());
  const toggleBreakDay = (day: number) => setNewBreakDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort());

  const addBreak = async () => {
    if (!barbershop || !editing) return;
    const breakDef = BREAK_TYPES.find(b => b.value === newBreakType);
    const breakLabel = breakDef?.label || "Pausa";
    const isAllDay = breakDef?.allDay || false;
    const reasonText = newBreakNote.trim() ? `${breakLabel} — ${newBreakNote.trim()}` : breakLabel;
    const { error } = await supabase.from("blocked_times").insert({
      barbershop_id: barbershop.id,
      professional_id: editing.id,
      date: format(new Date(), "yyyy-MM-dd"),
      start_time: isAllDay ? null : newBreakStart,
      end_time: isAllDay ? null : newBreakEnd,
      recurring: true,
      recurring_days: newBreakDays,
      reason: reasonText,
      all_day: isAllDay,
    });
    if (error) {
      toast({ title: "Erro ao adicionar pausa", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Pausa adicionada!" });
    setNewBreakNote("");
    loadBreaks(editing.id);
  };

  const removeBreak = async (breakId: string) => {
    await supabase.from("blocked_times").delete().eq("id", breakId);
    toast({ title: "Pausa removida." });
    if (editing) loadBreaks(editing.id);
  };

  const handleSave = async () => {
    if (!barbershop || !name.trim()) return;
    setSaving(true);
    const payload = { name, role, specialties: specialties.split(",").map((s) => s.trim()).filter(Boolean), work_start: workStart, work_end: workEnd, work_days: workDays };
    if (editing) {
      const { error } = await supabase.from("professionals").update(payload).eq("id", editing.id);
      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      toast({ title: "Profissional atualizado!" });
    } else {
      const { error } = await supabase.from("professionals").insert({ ...payload, barbershop_id: barbershop.id });
      if (error) {
        const isLimitError = error.message.includes("plano") || error.message.includes("profissional");
        toast({
          title: isLimitError ? "Limite do plano atingido" : "Erro ao adicionar",
          description: isLimitError
            ? `${error.message} Faça upgrade para continuar.`
            : error.message,
          variant: "destructive",
        });
        if (isLimitError) showUpgrade("agenda");
        setSaving(false);
        return;
      }
      toast({ title: "Profissional adicionado!" });
    }
    setSaving(false); setDialogOpen(false); load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("professionals").delete().eq("id", id);
    toast({ title: "Profissional removido." }); load();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await supabase.from("professionals").update({ active: !isActive }).eq("id", id); load();
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
          <p className="text-sm font-medium text-muted-foreground">Adicione seu primeiro profissional</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Cadastre quem vai atender para começar a receber agendamentos.</p>
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
              className={`group rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-[var(--shadow-md)] cursor-pointer ${!p.is_active ? "opacity-50" : ""}`}
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
                  <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p.id, p.is_active)} />
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar profissional" : "Novo profissional"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
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

            {/* ── Schedule Breaks Section ── */}
            {editing && (
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-primary" />
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pausas e intervalos</Label>
                </div>

                {/* Existing breaks */}
                {breaksLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : breaks.length > 0 ? (
                  <div className="space-y-2">
                    {breaks.map((b) => (
                      <div key={b.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-accent/30 px-3 py-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-sm">{BREAK_TYPES.find(t => t.value === b.type)?.icon || "⏸"}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground">{b.reason}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {b.all_day ? "Dia inteiro" : `${b.start_time} - ${b.end_time}`} · {b.recurring_days.map(d => WEEKDAYS[d]).join(", ")}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => b.id && removeBreak(b.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/60 py-2">Nenhuma pausa configurada. Adicione intervalos como almoço ou pausas pessoais.</p>
                )}

                {/* Add break form */}
                <div className="rounded-xl border border-border/60 bg-card p-3 space-y-3">
                  <p className="text-xs font-medium text-foreground">Adicionar pausa</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {BREAK_TYPES.map((bt) => (
                      <button
                        key={bt.value}
                        type="button"
                        onClick={() => setNewBreakType(bt.value)}
                        className={`py-2 rounded-lg text-xs font-medium transition-all ${
                          newBreakType === bt.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {bt.icon} {bt.label}
                      </button>
                    ))}
                  </div>
                  {!BREAK_TYPES.find(b => b.value === newBreakType)?.allDay && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Início</Label>
                        <Input type="time" value={newBreakStart} onChange={(e) => setNewBreakStart(e.target.value)} className="bg-card h-9 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Fim</Label>
                        <Input type="time" value={newBreakEnd} onChange={(e) => setNewBreakEnd(e.target.value)} className="bg-card h-9 text-sm" />
                      </div>
                    </div>
                  )}
                  {BREAK_TYPES.find(b => b.value === newBreakType)?.allDay && (
                    <p className="text-[11px] text-muted-foreground bg-accent/40 rounded-lg px-3 py-2">⏸ Bloqueia o dia inteiro nos dias selecionados</p>
                  )}
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Dias</Label>
                    <div className="flex gap-1">
                      {WEEKDAYS.map((d, i) => (
                        <button key={i} type="button" onClick={() => toggleBreakDay(i)}
                          className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all ${newBreakDays.includes(i) ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground hover:bg-secondary"}`}
                        >{d}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Observação (opcional)</Label>
                    <Input value={newBreakNote} onChange={(e) => setNewBreakNote(e.target.value)} placeholder="Ex: Consulta médica" className="bg-card h-9 text-sm" />
                  </div>
                  <Button size="sm" variant="outline" className="w-full h-9 text-xs rounded-lg" onClick={addBreak} disabled={newBreakDays.length === 0}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar pausa
                  </Button>
                </div>
              </div>
            )}
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
