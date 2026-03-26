import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Plus, AlertTriangle, Repeat, UserCheck, UserX } from "lucide-react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useClientStats } from "@/components/clients/useClientStats";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientDetailPanel, type ClientDetailData } from "@/components/clients/ClientDetailPanel";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { getClientKeyFromAppointment, getClientKeyFromClient } from "@/lib/clientAnalytics";

type ClientFilter = "all" | "new" | "recurring" | "at_risk" | "inactive";

export default function ClientsPage() {
  const { barbershop } = useBarbershop();
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState<ClientFilter>("all");
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

  useEffect(() => {
    loadData();
  }, [barbershop]);

  const { clientStats, getClientStatus } = useClientStats(allAppointments);

  const enrichedClients = useMemo(
    () => clients.map((client) => ({ ...client, status: getClientStatus(client) })),
    [clients, getClientStatus]
  );

  const filtered = useMemo(() => {
    return enrichedClients.filter((client) => {
      const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase()) ||
        (client.phone && client.phone.includes(search)) ||
        (client.email && client.email.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;
      if (filter === "all") return true;
      return client.status.type === filter;
    });
  }, [enrichedClients, search, filter]);

  const overview = useMemo(() => {
    const counts = {
      total: enrichedClients.length,
      new: 0,
      recurring: 0,
      at_risk: 0,
      inactive: 0,
      totalRevenue: 0,
    };

    enrichedClients.forEach((client) => {
      counts[client.status.type] += 1;
      counts.totalRevenue += client.status.totalSpent || 0;
    });

    return counts;
  }, [enrichedClients]);

  const openDetail = (client: any) => {
    const key = getClientKeyFromClient(client);
    const stat = clientStats.get(key);
    const appointments = allAppointments
      .filter((appointment) => getClientKeyFromAppointment(appointment) === key)
      .slice()
      .sort((a: any, b: any) => `${b.date} ${b.start_time || ""}`.localeCompare(`${a.date} ${a.start_time || ""}`));
    const today = format(new Date(), "yyyy-MM-dd");

    const nextAppointment = allAppointments
      .filter((appointment) =>
        appointment.date >= today &&
        appointment.status !== "cancelled" &&
        appointment.status !== "rescheduled" &&
        getClientKeyFromAppointment(appointment) === key
      )
      .sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`))[0] || null;

    setSelectedClient({
      client,
      appointments,
      totalSpent: stat?.totalSpent || 0,
      visitCount: stat?.count || 0,
      averageTicket: stat?.averageTicket || 0,
      firstVisit: stat?.firstDate || null,
      lastVisit: stat?.lastDate || null,
      nextAppointment,
      preferredPro: stat?.preferredProfessional || null,
      topService: stat?.preferredService || null,
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

  const handleClientUpdated = (updatedClient: any) => {
    setClients((current) => current.map((client) => (client.id === updatedClient.id ? { ...client, ...updatedClient } : client)));
    setSelectedClient((current) => {
      if (!current || current.client.id !== updatedClient.id) return current;
      return {
        ...current,
        client: { ...current.client, ...updatedClient },
      };
    });
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
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
            <p className="text-sm text-muted-foreground">
              {clients.length} clientes cadastrados · R$ {overview.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} em valor historico
            </p>
          </div>
        </div>
        <Button onClick={handleNewClient} className="gap-2">
          <Plus className="h-4 w-4" /> Novo cliente
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-3"
      >
        {[
          { label: "Total", value: overview.total, color: "text-foreground", icon: Users },
          { label: "Novos", value: overview.new, color: "text-blue-600", icon: UserCheck },
          { label: "Recorrentes", value: overview.recurring, color: "text-primary", icon: Repeat },
          { label: "Em risco", value: overview.at_risk, color: "text-amber-600", icon: AlertTriangle },
          { label: "Inativos", value: overview.inactive, color: "text-destructive", icon: UserX },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{stat.label}</p>
              <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
            </div>
            <p className={`text-lg font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Buscar por nome, telefone ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border/60"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {([
            { key: "all" as const, label: "Todos" },
            { key: "new" as const, label: "Novos" },
            { key: "recurring" as const, label: "Recorrentes" },
            { key: "at_risk" as const, label: "Em risco" },
            { key: "inactive" as const, label: "Inativos" },
          ]).map((tab) => (
            <Button
              key={tab.key}
              size="sm"
              variant={filter === tab.key ? "default" : "outline"}
              onClick={() => setFilter(tab.key)}
              className={`text-xs rounded-lg ${filter !== tab.key ? "border-border/60 text-muted-foreground" : ""}`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <ClientsTable clients={filtered} onSelect={openDetail} />
      </motion.div>

      <AnimatePresence>
        {selectedClient && (
          <ClientDetailPanel
            detail={selectedClient}
            onClose={() => setSelectedClient(null)}
            onEdit={handleEdit}
            onUpdated={handleClientUpdated}
          />
        )}
      </AnimatePresence>

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
