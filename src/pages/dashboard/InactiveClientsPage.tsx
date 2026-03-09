import { useState, useEffect, useMemo } from "react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search, UserX, Send, Clock, Phone, Mail, Loader2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function InactiveClientsPage() {
  const { barbershop } = useBarbershop();
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [message, setMessage] = useState("Olá {{nome}}, sentimos sua falta!\n\nFaz um tempo que você não nos visita. Que tal agendar um horário?\n\nAcesse: {{link}}");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!barbershop) return;
    Promise.all([
      supabase.from("clients").select("*").eq("barbershop_id", barbershop.id).order("name"),
      supabase.from("appointments").select("client_name, client_email, client_phone, date, status")
        .eq("barbershop_id", barbershop.id).neq("status", "cancelled"),
    ]).then(([cRes, aRes]) => {
      setClients(cRes.data || []);
      setAppointments(aRes.data || []);
      setLoading(false);
    });
  }, [barbershop]);

  const inactiveClients = useMemo(() => {
    const clientLastVisit = new Map<string, string>();
    appointments.forEach((a) => {
      const key = (a.client_email || a.client_phone || a.client_name).toLowerCase();
      const existing = clientLastVisit.get(key);
      if (!existing || a.date > existing) clientLastVisit.set(key, a.date);
    });

    return clients.filter((c) => {
      const key = (c.email || c.phone || c.name).toLowerCase();
      const lastDate = clientLastVisit.get(key);
      if (!lastDate) return true;
      const days = Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 30;
    }).map((c) => {
      const key = (c.email || c.phone || c.name).toLowerCase();
      const lastDate = clientLastVisit.get(key);
      const daysSince = lastDate
        ? Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      return { ...c, daysSince, lastDate };
    }).sort((a, b) => (b.daysSince || 999) - (a.daysSince || 999));
  }, [clients, appointments]);

  const filtered = inactiveClients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    const next = new Set(selectedClients);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedClients(next);
  };

  const selectAll = () => {
    if (selectedClients.size === filtered.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(filtered.map((c) => c.id)));
    }
  };

  const handleSendCampaign = async () => {
    if (!barbershop || selectedClients.size === 0) return;
    setSending(true);

    // Create campaign
    const { data: campaign, error: campError } = await supabase.from("campaigns").insert({
      barbershop_id: barbershop.id,
      title: `Reativação de clientes inativos`,
      message,
      audience: "inactive",
      channel: "whatsapp",
      status: "sent",
      sent_at: new Date().toISOString(),
      recipient_count: selectedClients.size,
    }).select("id").single();

    if (campError || !campaign) {
      toast({ title: "Erro ao criar campanha", variant: "destructive" });
      setSending(false);
      return;
    }

    // Create notifications for each client
    const selected = inactiveClients.filter((c) => selectedClients.has(c.id));
    const notifications = selected.map((c) => ({
      barbershop_id: barbershop.id,
      channel: c.email ? "email" : "whatsapp",
      type: "reactivation_campaign",
      recipient_name: c.name,
      recipient_email: c.email,
      recipient_phone: c.phone,
      subject: "Sentimos sua falta!",
      body: message.replace("{{nome}}", c.name).replace("{{link}}", `${window.location.origin}/b/${barbershop.slug}`),
      status: "pending",
      scheduled_for: new Date().toISOString(),
    }));

    await supabase.from("notifications").insert(notifications as any);

    // Create campaign recipients
    const recipients = selected.map((c) => ({
      campaign_id: campaign.id,
      client_id: c.id,
      status: "pending",
    }));
    await supabase.from("campaign_recipients").insert(recipients);

    setSending(false);
    setCampaignOpen(false);
    setSelectedClients(new Set());
    toast({ title: `Campanha enviada para ${selected.length} clientes!` });
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Clientes Inativos</h2>
          <p className="text-muted-foreground text-sm">
            {inactiveClients.length} clientes sem visita há 30+ dias
          </p>
        </div>
        {selectedClients.size > 0 && (
          <Button onClick={() => setCampaignOpen(true)} className="gap-2">
            <Send className="h-4 w-4" /> Enviar campanha ({selectedClients.size})
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button size="sm" variant="outline" onClick={selectAll}>
          {selectedClients.size === filtered.length ? "Desmarcar todos" : "Selecionar todos"}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <UserX className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground font-medium">Nenhum cliente inativo!</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Todos os seus clientes estão ativos. Parabéns!</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedClients.size === filtered.length && filtered.length > 0}
                    onChange={selectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Cliente</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4 hidden sm:table-cell">Contato</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Inativo há</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4 hidden md:table-cell">Última visita</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedClients.has(c.id)}
                      onChange={() => toggleSelect(c.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-warning/10 flex items-center justify-center text-sm font-semibold text-warning">
                        {c.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium text-sm">{c.name}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <div className="space-y-0.5">
                      {c.phone && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />{c.phone}
                        </span>
                      )}
                      {c.email && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />{c.email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20 text-[10px]">
                      <Clock className="h-3 w-3 mr-1" />
                      {c.daysSince ? `${c.daysSince} dias` : "Nunca agendou"}
                    </Badge>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                    {c.lastDate ? new Date(c.lastDate).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Send Campaign Dialog */}
      <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Campanha de Reativação
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-accent/50 rounded-lg p-3">
              <p className="text-sm font-medium">{selectedClients.size} clientes selecionados</p>
              <p className="text-xs text-muted-foreground">A mensagem será registrada e preparada para envio</p>
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Use {{nome}} e {{link}} como variáveis"
              />
              <p className="text-xs text-muted-foreground">Variáveis: {"{{nome}}"}, {"{{link}}"}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCampaignOpen(false)}>Cancelar</Button>
            <Button onClick={handleSendCampaign} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Enviar campanha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
