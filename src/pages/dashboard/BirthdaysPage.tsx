import { useState, useEffect, useMemo } from "react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cake, Search, Send, Phone, Mail, Loader2, Gift, PartyPopper,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format, isToday, isSameWeek, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BirthdaysPage() {
  const { barbershop } = useBarbershop();
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [message, setMessage] = useState(
    "Feliz aniversário, {{nome}}!\n\nPara comemorar, temos um presente especial para você!\n\nAgende seu horário: {{link}}"
  );
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!barbershop) return;
    supabase
      .from("clients")
      .select("*")
      .eq("barbershop_id", barbershop.id)
      .not("birth_date", "is", null)
      .order("name")
      .then(({ data }) => {
        setClients(data || []);
        setLoading(false);
      });
  }, [barbershop]);

  const now = new Date();

  const withBirthdayInfo = useMemo(() => {
    return clients.map((c) => {
      const bd = new Date(c.birth_date + "T12:00:00");
      // Create this year's birthday
      const thisYearBd = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
      return {
        ...c,
        birthMonth: bd.getMonth(),
        birthDay: bd.getDate(),
        thisYearBd,
        isBirthdayToday: isToday(thisYearBd),
        isBirthdayThisWeek: isSameWeek(thisYearBd, now, { weekStartsOn: 1 }),
        isBirthdayThisMonth: isSameMonth(thisYearBd, now),
        formattedDate: format(bd, "dd/MM", { locale: ptBR }),
      };
    }).sort((a, b) => {
      // Sort by day of month
      if (a.birthMonth !== b.birthMonth) return a.birthMonth - b.birthMonth;
      return a.birthDay - b.birthDay;
    });
  }, [clients, now]);

  const todayBirthdays = withBirthdayInfo.filter((c) => c.isBirthdayToday);
  const weekBirthdays = withBirthdayInfo.filter((c) => c.isBirthdayThisWeek);
  const monthBirthdays = withBirthdayInfo.filter((c) => c.isBirthdayThisMonth);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedClients);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedClients(next);
  };

  const handleSendCampaign = async () => {
    if (!barbershop || selectedClients.size === 0) return;
    setSending(true);

    const { data: campaign } = await supabase.from("campaigns").insert({
      barbershop_id: barbershop.id,
      title: `Feliz aniversário!`,
      message,
      audience: "birthday",
      channel: "whatsapp",
      status: "sent",
      sent_at: new Date().toISOString(),
      recipient_count: selectedClients.size,
    }).select("id").single();

    if (campaign) {
      const selected = withBirthdayInfo.filter((c) => selectedClients.has(c.id));
      const notifications = selected.map((c) => ({
        barbershop_id: barbershop.id,
        channel: c.email ? "email" : "whatsapp",
        type: "birthday_campaign",
        recipient_name: c.name,
        recipient_email: c.email,
        recipient_phone: c.phone,
        subject: "Feliz aniversário!",
        body: message
          .replace("{{nome}}", c.name)
          .replace("{{link}}", `${window.location.origin}/b/${barbershop.slug}`),
        status: "pending",
        scheduled_for: new Date().toISOString(),
      }));

      await supabase.from("notifications").insert(notifications as any);

      const recipients = selected.map((c) => ({
        campaign_id: campaign.id,
        client_id: c.id,
        status: "pending",
      }));
      await supabase.from("campaign_recipients").insert(recipients);
    }

    setSending(false);
    setCampaignOpen(false);
    setSelectedClients(new Set());
    toast({ title: `Mensagem enviada para ${selectedClients.size} aniversariantes!` });
  };

  const renderClientList = (list: any[]) => {
    const filtered = list.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );

    if (filtered.length === 0) {
      return (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Cake className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground font-medium">Nenhum aniversariante</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Cadastre a data de nascimento dos seus clientes para ver os aniversariantes.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={selectedClients.size === filtered.length && filtered.length > 0}
                  onChange={() => {
                    if (selectedClients.size === filtered.length) setSelectedClients(new Set());
                    else setSelectedClients(new Set(filtered.map((c) => c.id)));
                  }}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Cliente</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 hidden sm:table-cell">Contato</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Aniversário</th>
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
                    <div className="h-9 w-9 rounded-full bg-pink-500/10 flex items-center justify-center text-sm font-semibold text-pink-500">
                      {c.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <span className="font-medium text-sm">{c.name}</span>
                      {c.isBirthdayToday && (
                        <Badge className="ml-2 bg-pink-500/10 text-pink-500 border-pink-500/20 text-[10px]">
                          <PartyPopper className="h-3 w-3 mr-1" /> Hoje!
                        </Badge>
                      )}
                    </div>
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
                  <span className="text-sm font-medium">{c.formattedDate}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
            <Cake className="h-5 w-5 text-pink-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Aniversariantes</h2>
            <p className="text-muted-foreground text-sm">
              {todayBirthdays.length} hoje · {weekBirthdays.length} esta semana · {monthBirthdays.length} este mês
            </p>
          </div>
        </div>
        {selectedClients.size > 0 && (
          <Button onClick={() => setCampaignOpen(true)} className="gap-2">
            <Gift className="h-4 w-4" /> Enviar mensagem ({selectedClients.size})
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Hoje ({todayBirthdays.length})</TabsTrigger>
          <TabsTrigger value="week">Semana ({weekBirthdays.length})</TabsTrigger>
          <TabsTrigger value="month">Mês ({monthBirthdays.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="today">{renderClientList(todayBirthdays)}</TabsContent>
        <TabsContent value="week">{renderClientList(weekBirthdays)}</TabsContent>
        <TabsContent value="month">{renderClientList(monthBirthdays)}</TabsContent>
      </Tabs>

      {/* Send Campaign Dialog */}
      <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cake className="h-5 w-5 text-pink-500" />
              Mensagem de Aniversário
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-pink-500/5 border border-pink-500/10 rounded-lg p-3">
              <p className="text-sm font-medium">{selectedClients.size} aniversariantes selecionados</p>
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
              Enviar mensagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
