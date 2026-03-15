import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ExternalLink, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  phone: string | null;
  created_at: string;
  subscription?: {
    plan: string;
    status: string;
    trial_ends_at: string;
  };
  professionalsCount?: number;
  clientsCount?: number;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  trial: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  expired: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border",
  past_due: "bg-orange-500/10 text-orange-700 border-orange-500/20",
};

const statusLabels: Record<string, string> = {
  active: "Ativo",
  trial: "Trial",
  expired: "Expirado",
  cancelled: "Cancelado",
  past_due: "Inadimplente",
};

export default function MasterTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTenants() {
      // Fetch barbershops
      const { data: shops } = await supabase
        .from("barbershops")
        .select("id, name, slug, owner_id, phone, created_at")
        .order("created_at", { ascending: false });

      if (!shops) { setLoading(false); return; }

      // Fetch subscriptions for all shops
      const shopIds = shops.map((s) => s.id);
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("barbershop_id, plan, status, trial_ends_at")
        .in("barbershop_id", shopIds);

      // Fetch counts
      const { data: pros } = await supabase
        .from("professionals")
        .select("barbershop_id")
        .in("barbershop_id", shopIds)
        .eq("active", true);

      const { data: clients } = await supabase
        .from("clients")
        .select("barbershop_id")
        .in("barbershop_id", shopIds);

      const subMap = new Map(subs?.map((s) => [s.barbershop_id, s]) || []);
      const proCountMap = new Map<string, number>();
      const clientCountMap = new Map<string, number>();

      pros?.forEach((p) => proCountMap.set(p.barbershop_id, (proCountMap.get(p.barbershop_id) || 0) + 1));
      clients?.forEach((c) => clientCountMap.set(c.barbershop_id, (clientCountMap.get(c.barbershop_id) || 0) + 1));

      setTenants(shops.map((s) => ({
        ...s,
        subscription: subMap.get(s.id) as any,
        professionalsCount: proCountMap.get(s.id) || 0,
        clientsCount: clientCountMap.get(s.id) || 0,
      })));
      setLoading(false);
    }
    fetchTenants();
  }, []);

  const filtered = useMemo(() => {
    return tenants.filter((t) => {
      const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.subscription?.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tenants, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clientes da Plataforma</h1>
        <p className="text-muted-foreground text-sm">Gerencie todos os tenants do CutFlow.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
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
        <div className="text-center text-muted-foreground py-12">Carregando...</div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Profissionais</TableHead>
                <TableHead className="text-right">Clientes</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/master/tenants/${t.id}`)}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{t.slug}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {t.subscription?.plan || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[t.subscription?.status || ""] || ""}>
                        {statusLabels[t.subscription?.status || ""] || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{t.professionalsCount}</TableCell>
                    <TableCell className="text-right">{t.clientsCount}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); navigate(`/master/tenants/${t.id}`); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
