import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Phone, Star, UserCheck, UserX, Users, Mail, Inbox,
  ChevronRight, Calendar, DollarSign, Scissors, Clock, X, Gift,
} from "lucide-react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientDetail {
  client: any;
  appointments: any[];
  totalSpent: number;
  visitCount: number;
  lastVisit: string | null;
  nextAppointment: any | null;
  preferredPro: string | null;
  topService: string | null;
  status: { type: string; count: number; lastDate: string; daysSinceLast?: number };
}

export default function ClientsPage() {
  const { barbershop } = useBarbershop();
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "recurring" | "inactive" | "vip">("all");
  const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);

  useEffect(() => {
    if (!barbershop) return;
    Promise.all([
      supabase.from("clients").select("*").eq("barbershop_id", barbershop.id).order("name"),
      supabase.from("appointments").select("*, services(name, price), professionals(name)")
        .eq("barbershop_id", barbershop.id).order("date", { ascending: false }),
    ]).then(([clientRes, apptRes]) => {
      setClients(clientRes.data || []);
      setAllAppointments(apptRes.data || []);
    });
  }, [barbershop]);

  const clientStats = useMemo(() => {
    const stats = new Map<string, { count: number; lastDate: string; totalSpent: number; appointments: any[] }>();
    allAppointments.forEach(a => {
      if (a.status === "cancelled") return;
      const key = (a.client_email || a.client_phone || a.client_name).toLowerCase();
      const existing = stats.get(key);
      const price = Number(a.price || 0);
      if (!existing) {
        stats.set(key, { count: 1, lastDate: a.date, totalSpent: price, appointments: [a] });
      } else {
        existing.count++;
        existing.totalSpent += price;
        existing.appointments.push(a);
        if (a.date > existing.lastDate) existing.lastDate = a.date;
      }
    });
    return stats;
  }, [allAppointments]);

  const getClientStatus = (client: any) => {
    const key = (client.email || client.phone || client.name).toLowerCase();
    const stat = clientStats.get(key);
    if (!stat) return { type: "new" as const, count: 0, lastDate: "", totalSpent: 0, appointments: [] };
    const daysSinceLast = Math.floor((Date.now() - new Date(stat.lastDate).getTime()) / (1000 * 60 * 60 * 24));
    const type = stat.count >= 10 ? "vip" : stat.count >= 3 ? "recurring" : daysSinceLast > 30 ? "inactive" : stat.count > 0 ? "regular" : "new";
    return { type, count: stat.count, lastDate: stat.lastDate, daysSinceLast, totalSpent: stat.totalSpent, appointments: stat.appointments };
  };

  const enrichedClients = useMemo(() => clients.map(c => ({ ...c, status: getClientStatus(c) })), [clients, clientStats]);

  const filtered = enrichedClients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;
    if (filter === "recurring") return c.status.type === "recurring" || c.status.type === "vip";
    if (filter === "inactive") return c.status.type === "inactive";
    if (filter === "vip") return c.status.type === "vip";
    return true;
  });

  const vipCount = enrichedClients.filter(c => c.status.type === "vip").length;
  const recurringCount = enrichedClients.filter(c => c.status.type === "recurring" || c.status.type === "vip").length;
  const inactiveCount = enrichedClients.filter(c => c.status.type === "inactive").length;

  const openDetail = (client: any) => {
    const key = (client.email || client.phone || client.name).toLowerCase();
    const stat = clientStats.get(key);
    const appts = stat?.appointments || [];
    const today = format(new Date(), "yyyy-MM-dd");

    // Find preferred professional
    const proCounts: Record<string, number> = {};
    appts.forEach(a => {
      const name = a.professionals?.name;
      if (name) proCounts[name] = (proCounts[name] || 0) + 1;
    });
    const preferredPro = Object.entries(proCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Find top service
    const svcCounts: Record<string, number> = {};
    appts.forEach(a => {
      const name = a.services?.name;
      if (name) svcCounts[name] = (svcCounts[name] || 0) + 1;
    });
    const topService = Object.entries(svcCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Next appointment
    const futureAppts = allAppointments.filter(a =>
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

  const StatusBadge = ({ type }: { type: string }) => {
    const config: Record<string, { label: string; icon: any; className: string }> = {
      vip: { label: "VIP", icon: Star, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
      recurring: { label: "Recorrente", icon: Star, className: "bg-primary/10 text-primary border-primary/20" },
      inactive: { label: "Inativo", icon: UserX, className: "bg-destructive/10 text-destructive border-destructive/20" },
      regular: { label: "Regular", icon: UserCheck, className: "bg-muted text-muted-foreground border-border" },
      new: { label: "Novo", icon: Users, className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    };
    const c = config[type] || config.regular;
    const Icon = c.icon;
    return (
      <Badge variant="outline" className={`text-[10px] font-medium rounded-full gap-1 ${c.className}`}>
        <Icon className="h-3 w-3" /> {c.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
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
          <Input placeholder="Buscar por nome, telefone ou email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border/60" />
        </div>
        <div className="flex gap-1.5">
          {([
            { key: "all" as const, label: "Todos" },
            { key: "vip" as const, label: "VIP" },
            { key: "recurring" as const, label: "Recorrentes" },
            { key: "inactive" as const, label: "Inativos" },
          ]).map(f => (
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
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <Inbox className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground p-4">Cliente</th>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground p-4 hidden sm:table-cell">Contato</th>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground p-4">Status</th>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground p-4 hidden md:table-cell">Visitas</th>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground p-4 hidden lg:table-cell">Total gasto</th>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground p-4 hidden lg:table-cell">Aniversário</th>
                    <th className="p-4 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.id}
                      onClick={() => openDetail(c)}
                      className="border-b border-border/20 last:border-b-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-sm font-bold text-primary">
                            {c.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-medium text-sm text-foreground">{c.name}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <div className="space-y-0.5">
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Phone className="h-3 w-3" />{c.phone || "—"}
                          </span>
                          {c.email && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Mail className="h-3 w-3" />{c.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4"><StatusBadge type={c.status.type} /></td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{c.status.count > 0 ? `${c.status.count} visitas` : "—"}</span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-xs font-medium text-foreground">
                          {c.status.totalSpent > 0 ? `R$ ${c.status.totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {c.birth_date ? format(new Date(c.birth_date + "T12:00:00"), "dd/MM") : "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Client Detail Panel */}
      <AnimatePresence>
        {selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end"
          >
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setSelectedClient(null)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-card border-l border-border shadow-2xl overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-lg font-bold text-primary">
                      {selectedClient.client.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{selectedClient.client.name}</h3>
                      <StatusBadge type={selectedClient.status.type} />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedClient(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Contact info */}
                <div className="rounded-xl border border-border/60 p-4 space-y-2">
                  {selectedClient.client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedClient.client.phone}</span>
                    </div>
                  )}
                  {selectedClient.client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedClient.client.email}</span>
                    </div>
                  )}
                  {selectedClient.client.birth_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Gift className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {format(new Date(selectedClient.client.birth_date + "T12:00:00"), "dd 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total gasto", value: `R$ ${selectedClient.totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign },
                    { label: "Visitas", value: String(selectedClient.visitCount), icon: Calendar },
                    { label: "Profissional favorito", value: selectedClient.preferredPro || "—", icon: Star },
                    { label: "Serviço favorito", value: selectedClient.topService || "—", icon: Scissors },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl border border-border/60 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <s.icon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Last / Next visit */}
                <div className="space-y-2">
                  {selectedClient.lastVisit && (
                    <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                      <span className="text-xs text-muted-foreground">Última visita</span>
                      <span className="text-xs font-medium text-foreground">
                        {format(new Date(selectedClient.lastVisit + "T12:00:00"), "dd/MM/yyyy")}
                      </span>
                    </div>
                  )}
                  {selectedClient.nextAppointment && (
                    <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
                      <span className="text-xs text-primary font-medium">Próximo agendamento</span>
                      <span className="text-xs font-medium text-foreground">
                        {format(new Date(selectedClient.nextAppointment.date + "T12:00:00"), "dd/MM/yyyy")} às {selectedClient.nextAppointment.start_time?.slice(0, 5)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedClient.client.notes && (
                  <div className="rounded-xl border border-border/60 p-4">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Observações</span>
                    <p className="text-sm text-foreground mt-1">{selectedClient.client.notes}</p>
                  </div>
                )}

                {/* Appointment history */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Histórico de atendimentos
                  </h4>
                  {selectedClient.appointments.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhum atendimento registrado.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedClient.appointments.slice(0, 20).map((a: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:border-border transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-muted-foreground w-20">
                              {format(new Date(a.date + "T12:00:00"), "dd/MM/yy")}
                            </span>
                            <div>
                              <p className="text-xs font-medium text-foreground">{a.services?.name || "—"}</p>
                              <p className="text-[10px] text-muted-foreground">{a.professionals?.name} · {a.start_time?.slice(0, 5)}</p>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-foreground">
                            R$ {Number(a.price || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
