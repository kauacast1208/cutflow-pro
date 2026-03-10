import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Scissors, Loader2, Search, Clock, DollarSign, Tag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ServicesPage() {
  const { barbershop } = useBarbershop();
  const { toast } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const load = async () => {
    if (!barbershop) return;
    setLoading(true);
    const { data } = await supabase.from("services").select("*").eq("barbershop_id", barbershop.id).order("sort_order");
    setServices(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [barbershop]);

  const addService = async () => {
    if (!barbershop || !name.trim()) return;
    const { error } = await supabase.from("services").insert({
      barbershop_id: barbershop.id, name, duration_minutes: duration,
      price: parseFloat(price) || 0, category: category || null,
    });
    if (!error) {
      setShowNew(false); setName(""); setPrice(""); setCategory("");
      load(); toast({ title: "Serviço adicionado!" });
    }
  };

  const deleteService = async (id: string) => {
    await supabase.from("services").delete().eq("id", id);
    load(); toast({ title: "Serviço removido." });
  };

  const toggleService = async (id: string, active: boolean) => {
    await supabase.from("services").update({ active: !active }).eq("id", id); load();
  };

  const filtered = services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  if (!barbershop) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Scissors className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Serviços</h2>
            <p className="text-sm text-muted-foreground">{services.length} serviços cadastrados</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowNew(true)} className="gap-1.5 rounded-lg">
          <Plus className="h-4 w-4" /> Novo serviço
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input placeholder="Buscar serviço..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border/60" />
      </motion.div>

      {/* New service form */}
      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-primary/20 bg-accent/20 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground">Novo serviço</h3>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowNew(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Corte + Barba" className="bg-card" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categoria</Label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Corte" className="bg-card" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duração (min)</Label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="bg-card" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preço (R$)</Label>
                  <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="50.00" className="bg-card" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={addService} className="gap-1.5 rounded-lg">Salvar serviço</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowNew(false)} className="rounded-lg">Cancelar</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services list */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
            <div className="h-14 w-14 rounded-2xl bg-secondary/60 flex items-center justify-center mx-auto mb-4">
              <Scissors className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Nenhum serviço cadastrado</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Adicione seu primeiro serviço para começar.</p>
            <Button size="sm" className="mt-4 gap-1.5 rounded-lg" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4" /> Adicionar serviço
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`group rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-[var(--shadow-md)] ${!s.active ? "opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center transition-transform group-hover:scale-105">
                      <Scissors className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{s.name}</p>
                      {s.category && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Tag className="h-2.5 w-2.5" /> {s.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Switch checked={s.active} onCheckedChange={() => toggleService(s.id, s.active)} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duration_minutes} min</span>
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <DollarSign className="h-3 w-3 text-muted-foreground" /> R$ {Number(s.price).toFixed(2)}
                    </span>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => deleteService(s.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
