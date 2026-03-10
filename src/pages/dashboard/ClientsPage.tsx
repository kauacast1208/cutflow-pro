import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Plus } from "lucide-react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useClientStats } from "@/components/clients/useClientStats";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientDetailPanel, type ClientDetailData } from "@/components/clients/ClientDetailPanel";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";

export default function ClientsPage() {
  const { barbershop } = useBarbershop();
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "recurring" | "inactive" | "vip">("all");
  const [selectedClient, setSelectedClient] = useState<ClientDetailData | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);

  const loadData = () => {
    if (!barbershop) return;
    Promise.all([
      supabase.from("clients").select("*").eq("barbershop_id", barbershop.id).order("name"),
      supabase.from("appointments").select("*, services(name, price), professionals(name)")
        .eq("barbershop_id", barbershop.id).order("date", { ascending: false }),
    ]).then(([clientRes, apptRes]) => {
      setClients(clientRes.data || []);
      setAllAppointments(apptRes.data || []);
    });
  };

  useEffect(() => { loadData(); }, [barbershop]);

  const { clientStats, getClientStatus } = useClientStats(allAppointments);

  const enrichedClients = useMemo(
    () => clients.map((c) => ({ ...c, status: getClientStatus(c) })),
    [clients, clientStats]
  );

  const filtered = enrichedClients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;
    if (filter === "recurring") return c.status.type === "recurring" || c.status.type === "vip";
    if (filter === "inactive") return c.status.type === "inactive";
    if (filter === "vip") return c.status.type === "vip";
    return true;
  });

  const vipCount = enrichedClients.filter((c) => c.status.type === "vip").length;
  const recurringCount = enrichedClients.filter((c) => c.status.type === "recurring" || c.status.type === "vip").length;
  const inactiveCount = enrichedClients.filter((c) => c.status.type === "inactive").length;

  const openDetail = (client: any) => {
    const key = (client.email || client.phone || client.name).toLowerCase();
    const stat = clientStats.get(key);
    const appts = stat?.appointments || [];
    const today = format(new Date(), "yyyy-MM-dd");

    const proCounts: Record<string, number> = {};
    appts.forEach((a) => { const n = a.professionals?.name; if (n) proCounts[n] = (proCounts[n] || 0) + 1; });
    const preferredPro = Object.entries(proCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const svcCounts: Record<string, number> = {};
    appts.forEach((a) => { const n = a.services?.name; if (n) svcCounts[n] = (svcCounts[n] || 0) + 1; });
    const topService = Object.entries(svcCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const futureAppts = allAppointments.filter((a) =>
      a.date >= today && a.status !== "cancelled" &&
      (a.client_email || a.client_phone || a.client_name).toLowerCase() === key
    );
    const nextAppointment = futureAppts.length > 0 ? futureAppts[futureAppts.length - 1] : null;

    setSelectedClient({
      client,
      appointments: appts.sort((a: any, b: any) => b.date.localeCompare(a.date)),
      totalSpent: stat?.totalSpent || 0,
      visitCount: stat?.count || 0,
      lastVisit: stat?.lastDate || null,
      nextAppointment,
      preferredPro,
      topService,
      status: client.status || getClientStatus(client),
    });
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setFormOpen(true);
    setSelectedClient(null);
  };

  const handleNewClient = () => {
    setEditingClient(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Clientes
            </h2>
            <p className="text-sm text-muted-foreground">{clients.length} clientes cadastrados</p>
          </div>
        </div>
        <Button onClick={handleNewClient} className="gap-2">
          <Plus className="h-4 w-4" /> Novo cliente
        </Button>
      </motion.div>

      {/* Stats cards */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: "Total", value: clients.length, color: "text-foreground" },
          { label: "VIP", value: vipCount, color: "text-amber-600" },
          { label: "Recorrentes", value: recurringCount, color: "text-primary" },
          { label: "Inativos", value: inactiveCount, color: "text-destructive" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input placeholder="Buscar por nome, telefone ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border/60" />
        </div>
        <div className="flex gap-1.5">
          {([
            { key: "all" as const, label: "Todos" },
            { key: "vip" as const, label: "VIP" },
            { key: "recurring" as const, label: "Recorrentes" },
            { key: "inactive" as const, label: "Inativos" },
          ]).map((f) => (
            <Button key={f.key} size="sm"
              variant={filter === f.key ? "default" : "outline"}
              onClick={() => setFilter(f.key)}
              className={`text-xs rounded-lg ${filter !== f.key ? "border-border/60 text-muted-foreground" : ""}`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <ClientsTable clients={filtered} onSelect={openDetail} />
      </motion.div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedClient && (
          <ClientDetailPanel detail={selectedClient} onClose={() => setSelectedClient(null)} onEdit={handleEdit} />
        )}
      </AnimatePresence>

      {/* Form Dialog */}
      {barbershop && (
        <ClientFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          barbershopId={barbershop.id}
          client={editingClient}
          onSaved={loadData}
        />
      )}
    </div>
  );
}
