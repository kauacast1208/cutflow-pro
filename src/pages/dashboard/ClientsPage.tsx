import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Phone, Star, UserCheck, UserX, Users, Mail, Inbox } from "lucide-react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function ClientsPage() {
  const { barbershop } = useBarbershop();
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "recurring" | "inactive">("all");

  useEffect(() => {
    if (!barbershop) return;
    Promise.all([
      supabase.from("clients").select("*").eq("barbershop_id", barbershop.id).order("name"),
      supabase.from("appointments").select("client_name, client_email, client_phone, date, status")
        .eq("barbershop_id", barbershop.id).neq("status", "cancelled"),
    ]).then(([clientRes, apptRes]) => {
      setClients(clientRes.data || []);
      setAppointments(apptRes.data || []);
    });
  }, [barbershop]);

  const clientStats = useMemo(() => {
    const stats = new Map<string, { count: number; lastDate: string }>();
    appointments.forEach((a) => {
      const key = (a.client_email || a.client_phone || a.client_name).toLowerCase();
      const existing = stats.get(key);
      if (!existing) stats.set(key, { count: 1, lastDate: a.date });
      else { existing.count++; if (a.date > existing.lastDate) existing.lastDate = a.date; }
    });
    return stats;
  }, [appointments]);

  const getClientStatus = (client: any) => {
    const key = (client.email || client.phone || client.name).toLowerCase();
    const stat = clientStats.get(key);
    if (!stat) return { type: "new" as const, count: 0, lastDate: "" };
    const daysSinceLast = Math.floor((Date.now() - new Date(stat.lastDate).getTime()) / (1000 * 60 * 60 * 24));
    if (stat.count >= 3) return { type: "recurring" as const, count: stat.count, lastDate: stat.lastDate, daysSinceLast };
    if (daysSinceLast > 30) return { type: "inactive" as const, count: stat.count, lastDate: stat.lastDate, daysSinceLast };
    return { type: "regular" as const, count: stat.count, lastDate: stat.lastDate, daysSinceLast };
  };

  const enrichedClients = useMemo(() => clients.map((c) => ({ ...c, status: getClientStatus(c) })), [clients, clientStats]);
  const filtered = enrichedClients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "recurring") return c.status.type === "recurring";
    if (filter === "inactive") return c.status.type === "inactive";
    return true;
  });

  const recurringCount = enrichedClients.filter((c) => c.status.type === "recurring").length;
  const inactiveCount = enrichedClients.filter((c) => c.status.type === "inactive").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Clientes</h2>
            <p className="text-sm text-muted-foreground">{clients.length} clientes cadastrados</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border/60" />
        </div>
        <div className="flex gap-2">
          {[
            { key: "all" as const, label: `Todos (${clients.length})`, icon: null },
            { key: "recurring" as const, label: `Recorrentes (${recurringCount})`, icon: Star },
            { key: "inactive" as const, label: `Inativos (${inactiveCount})`, icon: UserX },
          ].map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? "default" : "outline"}
              onClick={() => setFilter(f.key)}
              className={`text-xs rounded-lg gap-1.5 ${filter !== f.key ? "border-border/60 text-muted-foreground" : ""}`}
            >
              {f.icon && <f.icon className="h-3.5 w-3.5" />}
              {f.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
            <div className="h-14 w-14 rounded-2xl bg-secondary/60 flex items-center justify-center mx-auto mb-4">
              <Inbox className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Nenhum cliente encontrado</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Clientes são adicionados automaticamente ao realizarem agendamentos.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40 bg-secondary/20">
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground p-4">Cliente</th>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground p-4 hidden sm:table-cell">Contato</th>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground p-4 hidden md:table-cell">E-mail</th>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground p-4">Status</th>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground p-4 hidden lg:table-cell">Visitas</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border/20 last:border-b-0 hover:bg-secondary/20 transition-colors"
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
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Phone className="h-3 w-3" />{c.phone || "—"}
                        </span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Mail className="h-3 w-3" />{c.email || "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        {c.status.type === "recurring" && (
                          <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-medium rounded-full gap-1">
                            <Star className="h-3 w-3" /> Recorrente
                          </Badge>
                        )}
                        {c.status.type === "inactive" && (
                          <Badge className="bg-warning/10 text-warning border-0 text-[10px] font-medium rounded-full gap-1">
                            <UserX className="h-3 w-3" /> Inativo
                          </Badge>
                        )}
                        {c.status.type === "regular" && (
                          <Badge variant="secondary" className="text-[10px] font-medium rounded-full border-0 gap-1">
                            <UserCheck className="h-3 w-3" /> Regular
                          </Badge>
                        )}
                        {c.status.type === "new" && (
                          <Badge variant="outline" className="text-[10px] font-medium rounded-full border-border/60">Novo</Badge>
                        )}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">{c.status.count > 0 ? `${c.status.count} visitas` : "—"}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
