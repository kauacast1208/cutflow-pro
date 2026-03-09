import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBarbershop } from "@/hooks/useBarbershop";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Mail, Plus, Send, Clock, Users, Search, Eye, Trash2, CheckCircle2,
  XCircle, AlertCircle, Crown, MailOpen, Filter,
} from "lucide-react";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Client = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
};

type Campaign = {
  id: string;
  title: string;
  message: string;
  audience: string;
  channel: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  recipient_count: number | null;
  created_at: string;
};

type Recipient = {
  id: string;
  campaign_id: string;
  client_id: string;
  status: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
};

const messageTemplates = [
  {
    id: "promo",
    label: "Promoção",
    subject: "Promoção Especial",
    body: "Olá {nome}! Temos uma promoção especial esperando por você. Agende agora e aproveite condições exclusivas!",
  },
  {
    id: "reactivation",
    label: "Reativação",
    subject: "Sentimos sua falta!",
    body: "Olá {nome}! Faz tempo que não nos vemos. Que tal agendar um horário? Temos novidades incríveis esperando por você!",
  },
  {
    id: "birthday",
    label: "Aniversário",
    subject: "Feliz Aniversário!",
    body: "Parabéns, {nome}! Como presente de aniversário, preparamos algo especial para você. Agende seu horário e aproveite!",
  },
  {
    id: "custom",
    label: "Personalizada",
    subject: "",
    body: "",
  },
];

const recipientStatusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "Pendente", icon: Clock, color: "text-muted-foreground" },
  sent: { label: "Enviado", icon: CheckCircle2, color: "text-green-600" },
  failed: { label: "Falhou", icon: XCircle, color: "text-destructive" },
  delivered: { label: "Entregue", icon: MailOpen, color: "text-primary" },
};

export default function DirectMailPage() {
  const { barbershop } = useBarbershop();
  const { can, plan } = usePlanPermissions();
  const { toast } = useToast();

  const hasBasicMailing = can("basic_mailing");
  const hasFullMailing = can("mailing");

  const [clients, setClients] = useState<Client[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());

  // Send dialog
  const [sendOpen, setSendOpen] = useState(false);
  const [templateId, setTemplateId] = useState("promo");
  const [customTitle, setCustomTitle] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [sending, setSending] = useState(false);
  const [previewClient, setPreviewClient] = useState<Client | null>(null);

  // History dialog
  const [viewCampaign, setViewCampaign] = useState<Campaign | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientClients, setRecipientClients] = useState<Record<string, Client>>({});

  useEffect(() => {
    if (barbershop) {
      fetchClients();
      fetchCampaigns();
    }
  }, [barbershop]);

  const fetchClients = async () => {
    if (!barbershop) return;
    const { data } = await supabase
      .from("clients")
      .select("id, name, phone, email")
      .eq("barbershop_id", barbershop.id)
      .order("name");
    setClients((data as Client[]) || []);
  };

  const fetchCampaigns = async () => {
    if (!barbershop) return;
    setLoading(true);
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("barbershop_id", barbershop.id)
      .eq("audience", "direct_mail")
      .order("created_at", { ascending: false });
    setCampaigns((data as Campaign[]) || []);
    setLoading(false);
  };

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const toggleClient = (id: string) => {
    setSelectedClients((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedClients.size === filteredClients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(filteredClients.map((c) => c.id)));
    }
  };

  const template = messageTemplates.find((t) => t.id === templateId)!;
  const effectiveTitle = templateId === "custom" ? customTitle : template.subject;
  const effectiveMessage = templateId === "custom" ? customMessage : template.body;

  const resolveMessage = (msg: string, client: Client) =>
    msg.replace("{nome}", client.name);

  const openSendDialog = () => {
    if (selectedClients.size === 0) {
      toast({ title: "Selecione ao menos um cliente", variant: "destructive" });
      return;
    }
    setPreviewClient(clients.find((c) => selectedClients.has(c.id)) || null);
    setSendOpen(true);
  };

  const handleSend = async () => {
    if (!barbershop || !effectiveTitle.trim() || !effectiveMessage.trim()) {
      toast({ title: "Preencha título e mensagem", variant: "destructive" });
      return;
    }
    setSending(true);

    // Create campaign
    const { data: campaign, error: campError } = await supabase
      .from("campaigns")
      .insert({
        barbershop_id: barbershop.id,
        title: effectiveTitle,
        message: effectiveMessage,
        audience: "direct_mail",
        channel,
        status: "sent",
        sent_at: new Date().toISOString(),
        recipient_count: selectedClients.size,
      })
      .select("id")
      .single();

    if (campError || !campaign) {
      toast({ title: "Erro ao criar campanha", description: campError?.message, variant: "destructive" });
      setSending(false);
      return;
    }

    // Insert recipients
    const recipientRows = Array.from(selectedClients).map((clientId) => ({
      campaign_id: campaign.id,
      client_id: clientId,
      status: "sent", // simulated
      sent_at: new Date().toISOString(),
    }));

    const { error: recError } = await supabase.from("campaign_recipients").insert(recipientRows);

    if (recError) {
      toast({ title: "Erro ao registrar destinatários", description: recError.message, variant: "destructive" });
    } else {
      toast({ title: `Mala direta enviada para ${selectedClients.size} cliente(s)!` });
      setSendOpen(false);
      setSelectedClients(new Set());
      setTemplateId("promo");
      setCustomTitle("");
      setCustomMessage("");
      fetchCampaigns();
    }
    setSending(false);
  };

  const viewDetails = async (campaign: Campaign) => {
    setViewCampaign(campaign);
    const { data: recs } = await supabase
      .from("campaign_recipients")
      .select("*")
      .eq("campaign_id", campaign.id);
    const recipientList = (recs || []) as Recipient[];
    setRecipients(recipientList);

    // Fetch client info for recipients
    const clientIds = recipientList.map((r) => r.client_id);
    if (clientIds.length > 0) {
      const { data: clientData } = await supabase
        .from("clients")
        .select("id, name, phone, email")
        .in("id", clientIds);
      const map: Record<string, Client> = {};
      (clientData || []).forEach((c: any) => { map[c.id] = c; });
      setRecipientClients(map);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("campaigns").delete().eq("id", id);
    toast({ title: "Campanha removida" });
    fetchCampaigns();
  };

  // Plan gating
  if (!hasBasicMailing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Mala Direta</h2>
            <p className="text-sm text-muted-foreground">Envie mensagens em massa para seus clientes</p>
          </div>
        </div>
        <UpgradeBanner
          feature="basic_mailing"
          title="Mala Direta"
          description="Envie mensagens personalizadas em massa para seus clientes por WhatsApp e e-mail. Disponível a partir do plano Pro."
        />
      </div>
    );
  }

  const availableChannels = hasFullMailing
    ? [
        { value: "whatsapp", label: "WhatsApp" },
        { value: "email", label: "E-mail" },
      ]
    : [{ value: "whatsapp", label: "WhatsApp" }];

  const availableTemplates = hasFullMailing
    ? messageTemplates
    : messageTemplates.filter((t) => t.id !== "birthday");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Mala Direta</h2>
            <p className="text-sm text-muted-foreground">
              {hasFullMailing ? "Mala direta completa" : "Mala direta básica"} • Plano{" "}
              {plan === "premium" ? "Premium" : "Pro"}
            </p>
          </div>
        </div>
      </div>

      {/* Pro upsell */}
      {!hasFullMailing && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-4">
            <Crown className="h-8 w-8 text-primary shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Desbloqueie mala direta completa</p>
              <p className="text-xs text-muted-foreground">
                Canal de e-mail, template de aniversário e automação no plano Premium.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Upgrade
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{clients.length}</p>
              <p className="text-xs text-muted-foreground">Clientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <Send className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{campaigns.length}</p>
              <p className="text-xs text-muted-foreground">Envios realizados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{selectedClients.size}</p>
              <p className="text-xs text-muted-foreground">Selecionados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send">Novo Envio</TabsTrigger>
          <TabsTrigger value="history">Histórico ({campaigns.length})</TabsTrigger>
        </TabsList>

        {/* ========== SEND TAB ========== */}
        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" /> Selecione os destinatários
              </CardTitle>
              <CardDescription>
                Pesquise e selecione os clientes que receberão a mensagem.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, telefone ou e-mail..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={toggleAll}>
                  {selectedClients.size === filteredClients.length && filteredClients.length > 0
                    ? "Desmarcar todos"
                    : "Selecionar todos"}
                </Button>
                <Button
                  onClick={openSendDialog}
                  disabled={selectedClients.size === 0}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" /> Preparar envio ({selectedClients.size})
                </Button>
              </div>

              {filteredClients.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="font-medium">Nenhum cliente encontrado</p>
                  <p className="text-sm mt-1">Cadastre clientes para usar a mala direta.</p>
                </div>
              ) : (
                <div className="border rounded-lg max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              filteredClients.length > 0 &&
                              selectedClients.size === filteredClients.length
                            }
                            onCheckedChange={toggleAll}
                          />
                        </TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>E-mail</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map((client) => (
                        <TableRow
                          key={client.id}
                          className="cursor-pointer"
                          onClick={() => toggleClient(client.id)}
                        >
                          <TableCell>
                            <Checkbox checked={selectedClients.has(client.id)} />
                          </TableCell>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {client.phone || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {client.email || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== HISTORY TAB ========== */}
        <TabsContent value="history">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Carregando...
              </CardContent>
            </Card>
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">Nenhum envio realizado</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Selecione clientes e envie sua primeira mala direta.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Destinatários</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{c.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{c.message}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.channel === "email" ? "E-mail" : "WhatsApp"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{c.recipient_count || 0} cliente(s)</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.sent_at
                          ? format(new Date(c.sent_at), "dd/MM/yy HH:mm", { locale: ptBR })
                          : format(new Date(c.created_at), "dd/MM/yy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => viewDetails(c)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(c.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ========== SEND DIALOG ========== */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Preparar Envio
            </DialogTitle>
            <DialogDescription>
              {selectedClients.size} cliente(s) selecionado(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Modelo de mensagem</Label>
              <Select value={templateId} onValueChange={(v) => setTemplateId(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {templateId === "custom" && (
              <>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    placeholder="Título da mensagem"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mensagem</Label>
                  <Textarea
                    placeholder="Use {nome} para personalizar..."
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Canal</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableChannels.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            {previewClient && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Pré-visualização
                </Label>
                <div className="bg-muted rounded-lg p-4 space-y-1">
                  <p className="font-semibold text-sm">{effectiveTitle || "Sem título"}</p>
                  <p className="text-sm whitespace-pre-wrap">
                    {resolveMessage(effectiveMessage, previewClient) || "Sem mensagem"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Visualizando para: {previewClient.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSendOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSend} disabled={sending} className="gap-2">
              <Send className="h-4 w-4" /> Enviar para {selectedClients.size} cliente(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== DETAILS DIALOG ========== */}
      <Dialog open={!!viewCampaign} onOpenChange={() => setViewCampaign(null)}>
        <DialogContent className="sm:max-w-lg">
          {viewCampaign && (
            <>
              <DialogHeader>
                <DialogTitle>{viewCampaign.title}</DialogTitle>
                <DialogDescription>
                  Enviada em{" "}
                  {viewCampaign.sent_at
                    ? format(new Date(viewCampaign.sent_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                    : "—"}{" "}
                  • {viewCampaign.recipient_count || 0} destinatário(s)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{viewCampaign.message}</p>
                </div>

                {recipients.length > 0 && (
                  <div className="border rounded-lg max-h-[250px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Enviado em</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recipients.map((r) => {
                          const client = recipientClients[r.client_id];
                          const st = recipientStatusConfig[r.status] || recipientStatusConfig.pending;
                          const Icon = st.icon;
                          return (
                            <TableRow key={r.id}>
                              <TableCell className="font-medium">
                                {client?.name || "Cliente removido"}
                              </TableCell>
                              <TableCell>
                                <div className={`flex items-center gap-1.5 text-sm ${st.color}`}>
                                  <Icon className="h-3.5 w-3.5" />
                                  {st.label}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {r.sent_at
                                  ? format(new Date(r.sent_at), "dd/MM HH:mm", { locale: ptBR })
                                  : "—"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
