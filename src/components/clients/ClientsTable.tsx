import { Phone, Mail, ChevronRight, Inbox } from "lucide-react";
import { format } from "date-fns";
import { ClientStatusBadge } from "./ClientStatusBadge";

interface Props {
  clients: any[];
  onSelect: (client: any) => void;
}

export function ClientsTable({ clients, onSelect }: Props) {
  if (clients.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
        <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
          <Inbox className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Nenhum cliente encontrado</p>
      </div>
    );
  }

  return (
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
            {clients.map((c) => (
              <tr
                key={c.id}
                onClick={() => onSelect(c)}
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
                <td className="p-4"><ClientStatusBadge type={c.status.type} /></td>
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
  );
}
