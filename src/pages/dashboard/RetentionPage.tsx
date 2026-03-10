import { useState, useEffect, useMemo } from "react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Search, UserX, UserCheck, Users, Clock, Calendar, TrendingUp,
  MessageSquare, Loader2, ArrowRight, RefreshCw, AlertTriangle,
  Heart, Target, Send,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface RetentionClient {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  visitCount: number;
  lastVisit: string | null;
  avgFrequencyDays: number | null;
  daysSinceLastVisit: number;
  expectedReturnDate: string | null;
  daysOverdue: number;
  status: "active" | "returning_soon" | "inactive" | "lost";
  totalSpent: number;
  topService: string | null;
}

const statusConfig = {
  active: { label: "Ativo", color: "text-success", bg: "bg-success/10", border: "border-success/20", icon: UserCheck },
  returning_soon: { label: "Próximo retorno", color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Clock },
  inactive: { label: "Inativo", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", icon: UserX },
  lost: { label: "Perdido", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", icon: AlertTriangle },
};

export default function RetentionPage() {
  const { barbershop } = useBarbershop();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [clients, setClients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (!barbershop) return;
    Promise.all([
      supabase.from("clients").select("*").eq("barbershop_id", barbershop.id).order("name"),
      supabase.from("appointments").select("client_name, client_email, client_phone, date, status, price, service_id, services(name)")
        .eq("barbershop_id", barbershop.id).neq("status", "cancelled").order("date", { ascending: true }),
    ]).then(([cRes, aRes]) => {
      setClients(cRes.data || []);
      setAppointments(aRes.data || []);
      setLoading(false);
    });
  }, [barbershop]);

  const retentionClients = useMemo((): RetentionClient[] => {
    const clientAppts = new Map<string, any[]>();

    appointments.forEach((a) => {
      const key = (a.client_email || a.client_phone || a.client_name).toLowerCase();
      if (!clientAppts.has(key)) clientAppts.set(key, []);
      clientAppts.get(key)!.push(a);
    });

    return clients.map((c) => {
      const key = (c.email || c.phone || c.name).toLowerCase();
      const appts = clientAppts.get(key) || [];
      const sortedDates = appts.map((a) => a.date).sort();
      const visitCount = sortedDates.length;

      const lastVisit = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;
      const daysSinceLastVisit = lastVisit
        ? Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Calculate average frequency
      let avgFrequencyDays: number | null = null;
      if (sortedDates.length >= 2) {
        const intervals: number[] = [];
        for (let i = 1; i < sortedDates.length; i++) {
          const diff = Math.floor(
            (new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diff > 0) intervals.push(diff);
        }
        if (intervals.length > 0) {
          avgFrequencyDays = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
        }
      }

      const expectedReturnDate = lastVisit && avgFrequencyDays
        ? format(new Date(new Date(lastVisit).getTime() + avgFrequencyDays * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
        : null;

      const daysOverdue = avgFrequencyDays
        ? Math.max(0, daysSinceLastVisit - avgFrequencyDays)
        : 0;

      // Status classification
      let status: RetentionClient["status"] = "active";
      if (daysSinceLastVisit > 90) {
        status = "lost";
      } else if (avgFrequencyDays && daysSinceLastVisit > avgFrequencyDays * 1.25) {
        status = "inactive";
      } else if (avgFrequencyDays && daysSinceLastVisit >= avgFrequencyDays * 0.8) {
        status = "returning_soon";
      } else if (visitCount === 0) {
        status = "lost";
      }

      const totalSpent = appts.reduce((s: number, a: any) => s + (Number(a.price) || 0), 0);

      // Top service
      const svcCounts: Record<string, number> = {};
      appts.forEach((a: any) => {
        const name = a.services?.name;
        if (name) svcCounts[name] = (svcCounts[name] || 0) + 1;
      });
      const topService = Object.entries(svcCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        visitCount,
        lastVisit,
        avgFrequencyDays,
        daysSinceLastVisit,
        expectedReturnDate,
        daysOverdue,
        status,
        totalSpent,
        topService,
      };
    }).filter((c) => c.visitCount > 0);
  }, [clients, appointments]);

  const filtered = useMemo(() => {
    return retentionClients.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search));
      if (!matchSearch) return false;
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      return true;
    });
  }, [retentionClients, search, filterStatus]);

  // Stats
  const activeCount = retentionClients.filter((c) => c.status === "active").length;
  const returningSoonCount = retentionClients.filter((c) => c.status === "returning_soon").length;
  const inactiveCount = retentionClients.filter((c) => c.status === "inactive").length;
  const lostCount = retentionClients.filter((c) => c.status === "lost").length;

  const pieData = [
    { name: "Ativos", value: activeCount, color: "hsl(var(--success))" },
    { name: "Próx. retorno", value: returningSoonCount, color: "hsl(210, 90%, 55%)" },
    { name: "Inativos", value: inactiveCount, color: "hsl(var(--warning))" },
    { name: "Perdidos", value: lostCount, color: "hsl(var(--destructive))" },
  ].filter((d) => d.value > 0);

  const retentionRate = retentionClients.length > 0
    ? Math.round(((activeCount + returningSoonCount) / retentionClients.length) * 100)
    : 0;

  const avgFrequency = retentionClients.filter((c) => c.avgFrequencyDays).length > 0
    ? Math.round(
        retentionClients
          .filter((c) => c.avgFrequencyDays)
          .reduce((s, c) => s + c.avgFrequencyDays!, 0) /
        retentionClients.filter((c) => c.avgFrequencyDays).length
      )
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Retenção Inteligente</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Previsão de retorno e reativação automática de clientes
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => navigate("/dashboard/automations")}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Configurar automações
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Ativos", value: activeCount, icon: UserCheck, color: "text-success", bg: "bg-success/10" },
            { label: "Próx. retorno", value: returningSoonCount, icon: Clock, color: "text-blue-600", bg: "bg-blue-500/10" },
            { label: "Inativos", value: inactiveCount, icon: UserX, color: "text-warning", bg: "bg-warning/10" },
            { label: "Perdidos", value: lostCount, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border/60 bg-card p-4"
            >
              <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
          {/* Retention Rate */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border/60 bg-card p-4 col-span-2"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Taxa de retenção</span>
              </div>
              <span className="text-lg font-bold text-foreground">{retentionRate}%</span>
            </div>
            <Progress value={retentionRate} className="h-2" />
            {avgFrequency && (
              <p className="text-[11px] text-muted-foreground mt-2">
                Frequência média geral: <strong>{avgFrequency} dias</strong>
              </p>
            )}
          </motion.div>
          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border/60 bg-card p-4 col-span-2 space-y-2"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Insights</span>
            </div>
            {returningSoonCount > 0 && (
              <p className="text-sm text-foreground">
                📅 <strong>{returningSoonCount}</strong> cliente{returningSoonCount > 1 ? "s" : ""} dever{returningSoonCount > 1 ? "iam" : "ia"} retornar esta semana
              </p>
            )}
            {inactiveCount > 0 && (
              <p className="text-sm text-foreground">
                ⚠️ <strong>{inactiveCount}</strong> cliente{inactiveCount > 1 ? "s" : ""} passou da frequência média de retorno
              </p>
            )}
            {lostCount > 0 && (
              <p className="text-sm text-foreground">
                🚨 <strong>{lostCount}</strong> cliente{lostCount > 1 ? "s" : ""} não visita{lostCount > 1 ? "m" : ""} há mais de 90 dias
              </p>
            )}
            {retentionRate >= 80 && (
              <p className="text-sm text-success">✅ Excelente taxa de retenção!</p>
            )}
          </motion.div>
        </div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border/60 bg-card p-4"
        >
          <h3 className="text-sm font-semibold text-foreground mb-2">Distribuição de Retenção</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Client List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-border/60 bg-card overflow-hidden"
      >
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h3 className="font-semibold text-foreground">Clientes — Previsão de retorno</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-xs w-56 bg-card border-border/60"
              />
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { key: "all", label: `Todos (${retentionClients.length})` },
              { key: "active", label: `Ativos (${activeCount})` },
              { key: "returning_soon", label: `Próx. retorno (${returningSoonCount})` },
              { key: "inactive", label: `Inativos (${inactiveCount})` },
              { key: "lost", label: `Perdidos (${lostCount})` },
            ].map((f) => (
              <Button
                key={f.key}
                size="sm"
                variant={filterStatus === f.key ? "default" : "ghost"}
                className="text-xs h-7 px-2.5"
                onClick={() => setFilterStatus(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 space-y-2 max-h-[600px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Nenhum cliente encontrado</p>
            </div>
          ) : (
            filtered.sort((a, b) => b.daysOverdue - a.daysOverdue).map((c, i) => {
              const sc = statusConfig[c.status];
              const StatusIcon = sc.icon;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${sc.border} bg-card hover:shadow-sm transition-all`}
                >
                  <div className={`h-10 w-10 rounded-lg ${sc.bg} flex items-center justify-center shrink-0`}>
                    <StatusIcon className={`h-4 w-4 ${sc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      <Badge variant="secondary" className={`text-[10px] border-0 ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Última: {c.lastVisit ? format(new Date(c.lastVisit), "dd/MM/yy", { locale: ptBR }) : "—"}
                      </span>
                      {c.avgFrequencyDays && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          Freq: {c.avgFrequencyDays}d
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {c.daysSinceLastVisit}d atrás
                      </span>
                      {c.topService && (
                        <span className="text-[11px] text-muted-foreground">
                          ✂️ {c.topService}
                        </span>
                      )}
                    </div>
                    {c.expectedReturnDate && c.status !== "active" && (
                      <p className="text-[11px] mt-1">
                        <span className={c.daysOverdue > 0 ? "text-destructive" : "text-muted-foreground"}>
                          {c.daysOverdue > 0
                            ? `⚠️ ${c.daysOverdue} dias atrasado`
                            : `📅 Retorno esperado: ${format(new Date(c.expectedReturnDate), "dd/MM", { locale: ptBR })}`}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-semibold text-foreground">{c.visitCount} visitas</span>
                    <span className="text-[11px] text-muted-foreground">
                      R$ {c.totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
