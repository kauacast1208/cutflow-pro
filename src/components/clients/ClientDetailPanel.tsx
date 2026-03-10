import { Button } from "@/components/ui/button";
import { Phone, Mail, Gift, DollarSign, Calendar, Star, Scissors, Clock, X } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClientStatusBadge } from "./ClientStatusBadge";

export interface ClientDetailData {
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

interface Props {
  detail: ClientDetailData;
  onClose: () => void;
  onEdit: (client: any) => void;
}

export function ClientDetailPanel({ detail, onClose, onEdit }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
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
                {detail.client.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{detail.client.name}</h3>
                <ClientStatusBadge type={detail.status.type} />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => onEdit(detail.client)}>
                Editar
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contact info */}
          <div className="rounded-xl border border-border/60 p-4 space-y-2">
            {detail.client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{detail.client.phone}</span>
              </div>
            )}
            {detail.client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{detail.client.email}</span>
              </div>
            )}
            {detail.client.birth_date && (
              <div className="flex items-center gap-2 text-sm">
                <Gift className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  {format(new Date(detail.client.birth_date + "T12:00:00"), "dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total gasto", value: `R$ ${detail.totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign },
              { label: "Visitas", value: String(detail.visitCount), icon: Calendar },
              { label: "Profissional favorito", value: detail.preferredPro || "—", icon: Star },
              { label: "Serviço favorito", value: detail.topService || "—", icon: Scissors },
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

          {/* Ticket médio */}
          {detail.visitCount > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
              <span className="text-xs text-muted-foreground">Ticket médio</span>
              <span className="text-xs font-medium text-foreground">
                R$ {(detail.totalSpent / detail.visitCount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* Last / Next visit */}
          <div className="space-y-2">
            {detail.lastVisit && (
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span className="text-xs text-muted-foreground">Última visita</span>
                <span className="text-xs font-medium text-foreground">
                  {format(new Date(detail.lastVisit + "T12:00:00"), "dd/MM/yyyy")}
                </span>
              </div>
            )}
            {detail.nextAppointment && (
              <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
                <span className="text-xs text-primary font-medium">Próximo agendamento</span>
                <span className="text-xs font-medium text-foreground">
                  {format(new Date(detail.nextAppointment.date + "T12:00:00"), "dd/MM/yyyy")} às {detail.nextAppointment.start_time?.slice(0, 5)}
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          {detail.client.notes && (
            <div className="rounded-xl border border-border/60 p-4">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Observações</span>
              <p className="text-sm text-foreground mt-1">{detail.client.notes}</p>
            </div>
          )}

          {/* Appointment history */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Histórico de atendimentos
            </h4>
            {detail.appointments.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum atendimento registrado.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {detail.appointments.slice(0, 20).map((a: any, i: number) => (
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
  );
}
