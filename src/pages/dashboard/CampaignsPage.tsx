import { useState, useEffect } from "react";
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
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Megaphone, Plus, Send, Clock, FileText, Users, Mail,
  MessageSquare, Sparkles, Crown, CalendarClock, Trash2, Edit, Eye,
} from "lucide-react";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Campaign = {
  id: string;
  title: string;
  message: string;
  audience: string;
  channel: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
};

const audienceOptions = [
  { value: "all_clients", label: "Todos os clientes", icon: Users },
  { value: "inactive", label: "Clientes inativos", icon: Clock },
  { value: "recurring", label: "Clientes recorrentes", icon: Sparkles },
  { value: "birthday", label: "Aniversariantes", icon: CalendarClock },
];

const channelOptions = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { value: "email", label: "E-mail", icon: Mail },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Rascunho", variant: "secondary" },
  scheduled: { label: "Agendada", variant: "outline" },
  sent: { label: "Enviada", variant: "default" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

const emptyCampaign = {
  title: "",
  message: "",
  audience: "all_clients",
  channel: "whatsapp",
  scheduled_at: "",
};

export default function CampaignsPage() {
  const { barbershop } = useBarbershop();
  const { can, plan } = usePlanPermissions();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewCampaign, setViewCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState(emptyCampaign);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const hasSimple = can("simple_campaigns");
  const hasAdvanced = can("advanced_campaigns");

  // Pro can only use whatsapp and all_clients/inactive
  const availableAudiences = hasAdvanced
    ? audienceOptions
    : audienceOptions.filter((a) => ["all_clients", "inactive"].includes(a.value));

  const availableChannels = hasAdvanced
    ? channelOptions
    : channelOptions.filter((c) => c.value === "whatsapp");

  useEffect(() => {
    if (barbershop) fetchCampaigns();
  }, [barbershop]);

  const fetchCampaigns = async () => {
    if (!barbershop) return;
    setLoading(true);
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("barbershop_id", barbershop.id)
      .order("created_at", { ascending: false });
    setCampaigns((data as Campaign[]) || []);
    setLoading(false);
  };

  const handleSave = async (asDraft: boolean) => {
    if (!barbershop) return;
    if (!form.title.trim() || !form.message.trim()) {
      toast({ title: "Preencha título e mensagem", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      barbershop_id: barbershop.id,
      title: form.title,
      message: form.message,
      audience: form.audience,
      channel: form.channel,
      status: asDraft ? "draft" : form.scheduled_at ? "scheduled" : "sent",
      scheduled_at: form.scheduled_at || null,
      sent_at: !asDraft && !form.scheduled_at ? new Date().toISOString() : null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("campaigns").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("campaigns").insert(payload));
    }

    if (error) {
      toast({ title: "Erro ao salvar campanha", description: error.message, variant: "destructive" });
    } else {
      toast({ title: asDraft ? "Rascunho salvo!" : "Campanha criada!" });
      setDialogOpen(false);
      setForm(emptyCampaign);
      setEditingId(null);
      fetchCampaigns();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("campaigns").delete().eq("id", id);
    toast({ title: "Campanha removida" });
    fetchCampaigns();
  };

  const openEdit = (c: Campaign) => {
    setForm({
      title: c.title,
      message: c.message,
      audience: c.audience,
      channel: c.channel,
      scheduled_at: c.scheduled_at ? c.scheduled_at.slice(0, 16) : "",
    });
    setEditingId(c.id);
    setDialogOpen(true);
  };

  const openNew = () => {
    setForm(emptyCampaign);
    setEditingId(null);
    setDialogOpen(true);
  };

  if (!hasSimple) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Campanhas</h2>
            <p className="text-sm text-muted-foreground">Engaje seus clientes com campanhas promocionais</p>
          </div>
        </div>
        <UpgradeBanner
          feature="simple_campaigns"
          title="Campanhas Promocionais"
          description="Crie e envie campanhas por WhatsApp e e-mail para engajar seus clientes. Disponível a partir do plano Pro."
        />
      </div>
    );
  }

  const drafts = campaigns.filter((c) => c.status === "draft");
  const scheduled = campaigns.filter((c) => c.status === "scheduled");
  const sent = campaigns.filter((c) => c.status === "sent");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Campanhas</h2>
            <p className="text-sm text-muted-foreground">
              {hasAdvanced ? "Campanhas completas" : "Campanhas simples"} • Plano {plan === "pro" ? "Pro" : "Premium"}
            </p>
          </div>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Campanha
        </Button>
      </div>

      {/* Pro upsell banner */}
      {!hasAdvanced && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-4">
            <Crown className="h-8 w-8 text-primary shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Desbloqueie campanhas avançadas</p>
              <p className="text-xs text-muted-foreground">
                Público por recorrência e aniversário, envio por e-mail, automação e mala direta no plano Premium.
              </p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
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
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{drafts.length}</p>
              <p className="text-xs text-muted-foreground">Rascunhos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <Clock className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{scheduled.length}</p>
              <p className="text-xs text-muted-foreground">Agendadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sent.length}</p>
              <p className="text-xs text-muted-foreground">Enviadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="drafts">Rascunhos ({drafts.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Agendadas ({scheduled.length})</TabsTrigger>
          <TabsTrigger value="sent">Enviadas ({sent.length})</TabsTrigger>
        </TabsList>

        {["all", "drafts", "scheduled", "sent"].map((tab) => {
          const filtered = tab === "all" ? campaigns
            : tab === "drafts" ? drafts
            : tab === "scheduled" ? scheduled
            : sent;

          return (
            <TabsContent key={tab} value={tab}>
              {loading ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">Carregando...</CardContent></Card>
              ) : filtered.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-medium">Nenhuma campanha {tab !== "all" ? statusConfig[tab === "drafts" ? "draft" : tab === "scheduled" ? "scheduled" : "sent"]?.label.toLowerCase() : ""}</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Crie sua primeira campanha para engajar seus clientes</p>
                    <Button onClick={openNew} variant="outline" className="mt-4 gap-2">
                      <Plus className="h-4 w-4" /> Criar Campanha
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campanha</TableHead>
                        <TableHead>Público</TableHead>
                        <TableHead>Canal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((c) => {
                        const aud = audienceOptions.find((a) => a.value === c.audience);
                        const ch = channelOptions.find((ch) => ch.value === c.channel);
                        const st = statusConfig[c.status] || statusConfig.draft;
                        return (
                          <TableRow key={c.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{c.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{c.message}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-sm">
                                {aud && <aud.icon className="h-3.5 w-3.5 text-muted-foreground" />}
                                {aud?.label || c.audience}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-sm">
                                {ch && <ch.icon className="h-3.5 w-3.5 text-muted-foreground" />}
                                {ch?.label || c.channel}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={st.variant}>{st.label}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {c.sent_at
                                ? format(new Date(c.sent_at), "dd/MM/yy HH:mm", { locale: ptBR })
                                : c.scheduled_at
                                ? format(new Date(c.scheduled_at), "dd/MM/yy HH:mm", { locale: ptBR })
                                : format(new Date(c.created_at), "dd/MM/yy", { locale: ptBR })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewCampaign(c)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {c.status === "draft" && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              {editingId ? "Editar Campanha" : "Nova Campanha"}
            </DialogTitle>
            <DialogDescription>
              {hasAdvanced
                ? "Configure todos os detalhes da sua campanha."
                : "Crie uma campanha simples por WhatsApp."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Ex: Promoção de Verão"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                placeholder="Escreva a mensagem que seus clientes receberão..."
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Público-alvo</Label>
                <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAudiences.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        <span className="flex items-center gap-2">
                          <a.icon className="h-3.5 w-3.5" /> {a.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Canal</Label>
                <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableChannels.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <span className="flex items-center gap-2">
                          <c.icon className="h-3.5 w-3.5" /> {c.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Agendar envio (opcional)</Label>
              <Input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Deixe vazio para enviar agora (simulado)</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => handleSave(true)} disabled={saving}>
              <FileText className="h-4 w-4 mr-2" /> Salvar Rascunho
            </Button>
            <Button onClick={() => handleSave(false)} disabled={saving} className="gap-2">
              <Send className="h-4 w-4" /> {form.scheduled_at ? "Agendar" : "Enviar Agora"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewCampaign} onOpenChange={() => setViewCampaign(null)}>
        <DialogContent className="sm:max-w-md">
          {viewCampaign && (
            <>
              <DialogHeader>
                <DialogTitle>{viewCampaign.title}</DialogTitle>
                <DialogDescription>
                  <Badge variant={statusConfig[viewCampaign.status]?.variant || "secondary"} className="mt-1">
                    {statusConfig[viewCampaign.status]?.label || viewCampaign.status}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{viewCampaign.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Público</p>
                    <p className="font-medium">{audienceOptions.find((a) => a.value === viewCampaign.audience)?.label}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Canal</p>
                    <p className="font-medium">{channelOptions.find((c) => c.value === viewCampaign.channel)?.label}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Criada em</p>
                    <p className="font-medium">{format(new Date(viewCampaign.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                  </div>
                  {viewCampaign.sent_at && (
                    <div>
                      <p className="text-muted-foreground text-xs">Enviada em</p>
                      <p className="font-medium">{format(new Date(viewCampaign.sent_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
