import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface Sub {
  id: string;
  barbershop_id: string;
  plan: string;
  status: string;
  trial_ends_at: string;
  current_period_end: string | null;
  created_at: string;
  barbershop_name?: string;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  trial: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  expired: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border",
  past_due: "bg-orange-500/10 text-orange-700 border-orange-500/20",
};
const statusLabels: Record<string, string> = {
  active: "Ativo", trial: "Trial", expired: "Expirado", cancelled: "Cancelado", past_due: "Inadimplente",
};

export default function MasterSubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const [subsRes, shopsRes] = await Promise.all([
        supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
        supabase.from("barbershops").select("id, name"),
      ]);
      const nameMap = new Map(shopsRes.data?.map((s) => [s.id, s.name]) || []);
      setSubs((subsRes.data || []).map((s) => ({ ...s, barbershop_name: nameMap.get(s.barbershop_id) || "—" })));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => subs.filter((s) => filter === "all" || s.status === filter), [subs, filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assinaturas</h1>
          <p className="text-muted-foreground text-sm">Todas as assinaturas ativas na plataforma.</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
            <SelectItem value="past_due">Inadimplente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trial expira</TableHead>
                <TableHead>Período atual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma assinatura encontrada.</TableCell></TableRow>
              ) : filtered.map((s) => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/master/tenants/${s.barbershop_id}`)}>
                  <TableCell className="font-medium">{s.barbershop_name}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px] uppercase">{s.plan}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={statusColors[s.status] || ""}>{statusLabels[s.status] || s.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(s.trial_ends_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("pt-BR") : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
