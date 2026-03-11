import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useToast } from "@/hooks/use-toast";
import {
  Store, Clock, Scissors, Users, Shield, Loader2, Plus,
  Trash2, Save, Copy, ExternalLink, CreditCard, MessageCircle, Globe,
} from "lucide-react";
import SubscriptionManager from "@/components/billing/SubscriptionManager";
import WhatsAppSettingsPanel from "@/components/admin/WhatsAppSettingsPanel";

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.07 },
});

export default function SettingsPage() {
  const { barbershop, setBarbershop } = useBarbershop();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [openingTime, setOpeningTime] = useState("09:00");
  const [closingTime, setClosingTime] = useState("19:00");
  const [slotInterval, setSlotInterval] = useState(30);
  const [bufferMinutes, setBufferMinutes] = useState(0);
  const [minAdvance, setMinAdvance] = useState(1);
  const [allowCancel, setAllowCancel] = useState(true);
  const [allowReschedule, setAllowReschedule] = useState(true);
  const [cancelLimit, setCancelLimit] = useState(2);
  const [autoConfirm, setAutoConfirm] = useState(true);

  const [showNewService, setShowNewService] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("");

  const [showNewPro, setShowNewPro] = useState(false);
  const [newProName, setNewProName] = useState("");
  const [newProRole, setNewProRole] = useState("Barbeiro");

  const [showNewBlock, setShowNewBlock] = useState(false);
  const [blockDate, setBlockDate] = useState("");
  const [blockStart, setBlockStart] = useState("12:00");
  const [blockEnd, setBlockEnd] = useState("13:00");
  const [blockAllDay, setBlockAllDay] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockProId, setBlockProId] = useState<string>("");

  useEffect(() => {
    if (!barbershop) return;
    setName(barbershop.name || "");
    setPhone(barbershop.phone || "");
    setAddress(barbershop.address || "");
    setAddressComplement((barbershop as any).address_complement || "");
    setInstagram(barbershop.instagram || "");
    setWhatsapp(barbershop.whatsapp || "");
    setDescription(barbershop.description || "");
    setOpeningTime(barbershop.opening_time?.slice(0, 5) || "09:00");
    setClosingTime(barbershop.closing_time?.slice(0, 5) || "19:00");
    setSlotInterval(barbershop.slot_interval_minutes || 30);
    setBufferMinutes(barbershop.buffer_minutes || 0);
    setMinAdvance(barbershop.min_advance_hours || 1);
    setAllowCancel(barbershop.allow_online_cancellation ?? true);
    setAllowReschedule(barbershop.allow_online_reschedule ?? true);
    setCancelLimit(barbershop.cancellation_limit_hours || 2);
    setAutoConfirm(barbershop.auto_confirm ?? true);
    loadServices();
    loadProfessionals();
    loadBlockedTimes();
  }, [barbershop]);

  const loadServices = async () => {
    if (!barbershop) return;
    const { data } = await supabase.from("services").select("*").eq("barbershop_id", barbershop.id).order("sort_order");
    setServices(data || []);
  };
  const loadProfessionals = async () => {
    if (!barbershop) return;
    const { data } = await supabase.from("professionals").select("*").eq("barbershop_id", barbershop.id);
    setProfessionals(data || []);
  };
  const loadBlockedTimes = async () => {
    if (!barbershop) return;
    const { data } = await supabase.from("blocked_times").select("*").eq("barbershop_id", barbershop.id).order("date");
    setBlockedTimes(data || []);
  };

  const saveBarbershop = async () => {
    if (!barbershop) return;
    setSaving(true);
    const { data, error } = await supabase.from("barbershops").update({
      name, phone, address, address_complement: addressComplement || null, instagram, whatsapp, description,
      opening_time: openingTime, closing_time: closingTime,
      slot_interval_minutes: slotInterval, buffer_minutes: bufferMinutes,
      min_advance_hours: minAdvance, allow_online_cancellation: allowCancel,
      allow_online_reschedule: allowReschedule, cancellation_limit_hours: cancelLimit,
      auto_confirm: autoConfirm,
    }).eq("id", barbershop.id).select().single();
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setBarbershop(data);
      toast({ title: "Salvo!", description: "Configurações atualizadas." });
    }
  };

  const addService = async () => {
    if (!barbershop || !newServiceName.trim()) return;
    const { error } = await supabase.from("services").insert({
      barbershop_id: barbershop.id, name: newServiceName,
      duration_minutes: newServiceDuration, price: parseFloat(newServicePrice) || 0,
      category: newServiceCategory || null,
    });
    if (!error) {
      setShowNewService(false); setNewServiceName(""); setNewServicePrice(""); setNewServiceCategory("");
      loadServices(); toast({ title: "Serviço adicionado!" });
    }
  };
  const deleteService = async (id: string) => {
    await supabase.from("services").delete().eq("id", id);
    loadServices(); toast({ title: "Serviço removido." });
  };
  const toggleService = async (id: string, active: boolean) => {
    await supabase.from("services").update({ active: !active }).eq("id", id);
    loadServices();
  };
  const addProfessional = async () => {
    if (!barbershop || !newProName.trim()) return;
    const { error } = await supabase.from("professionals").insert({
      barbershop_id: barbershop.id, name: newProName, role: newProRole,
    });
    if (!error) {
      setShowNewPro(false); setNewProName(""); setNewProRole("Barbeiro");
      loadProfessionals(); toast({ title: "Profissional adicionado!" });
    }
  };
  const deleteProfessional = async (id: string) => {
    await supabase.from("professionals").delete().eq("id", id);
    loadProfessionals(); toast({ title: "Profissional removido." });
  };
  const addBlockedTime = async () => {
    if (!barbershop || !blockDate) return;
    const { error } = await supabase.from("blocked_times").insert({
      barbershop_id: barbershop.id, professional_id: blockProId || null,
      date: blockDate, start_time: blockAllDay ? null : blockStart,
      end_time: blockAllDay ? null : blockEnd, all_day: blockAllDay,
      reason: blockReason || null,
    });
    if (!error) {
      setShowNewBlock(false); setBlockDate(""); setBlockReason("");
      loadBlockedTimes(); toast({ title: "Bloqueio adicionado!" });
    }
  };
  const deleteBlock = async (id: string) => {
    await supabase.from("blocked_times").delete().eq("id", id);
    loadBlockedTimes(); toast({ title: "Bloqueio removido." });
  };

  const bookingUrl = barbershop ? `${window.location.origin}/b/${barbershop.slug}` : "";

  if (!barbershop) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const CardSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-2xl border border-border bg-card p-6 hover:shadow-sm transition-shadow duration-300 ${className}`}>
      {children}
    </div>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {children}
    </h3>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div {...fadeUp(0)}>
        <h2
          className="text-2xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Configurações
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Gerencie todos os aspectos da sua barbearia.</p>
      </motion.div>

      <motion.div {...fadeUp(1)}>
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 h-auto rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="info" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Store className="h-3.5 w-3.5 mr-1.5" /> Dados
            </TabsTrigger>
            <TabsTrigger value="services" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Scissors className="h-3.5 w-3.5 mr-1.5" /> Serviços
            </TabsTrigger>
            <TabsTrigger value="professionals" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Users className="h-3.5 w-3.5 mr-1.5" /> Equipe
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Clock className="h-3.5 w-3.5 mr-1.5" /> Agenda
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Shield className="h-3.5 w-3.5 mr-1.5" /> Preferências
            </TabsTrigger>
            <TabsTrigger value="subscription" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Assinatura
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <MessageCircle className="h-3.5 w-3.5 mr-1.5" /> WhatsApp
            </TabsTrigger>
          </TabsList>

          {/* INFO */}
          <TabsContent value="info">
            <CardSection className="space-y-5">
              <SectionTitle>Informações da barbearia</SectionTitle>

              <div className="rounded-2xl bg-primary/[0.04] border border-primary/15 p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold text-foreground">Link público de agendamento</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Compartilhe este link com seus clientes para receberem agendamentos online.
                </p>
                <div className="flex items-center gap-2 rounded-xl bg-card border border-border p-2.5">
                  <code className="flex-1 text-xs sm:text-sm font-mono text-foreground truncate select-all px-1">
                    {bookingUrl}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 h-8 rounded-lg gap-1.5 text-xs"
                    onClick={() => { navigator.clipboard.writeText(bookingUrl); toast({ title: "Link copiado!" }); }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copiar
                  </Button>
                  <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <Button size="sm" variant="outline" className="h-8 rounded-lg gap-1.5 text-xs">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Abrir
                    </Button>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Nome" value={name} onChange={setName} />
                <FieldGroup label="Telefone" value={phone} onChange={setPhone} />
                <FieldGroup label="Endereço" value={address} onChange={setAddress} />
                <FieldGroup label="Complemento" value={addressComplement} onChange={setAddressComplement} placeholder="Apartamento, sala, bloco" />
                <FieldGroup label="Instagram" value={instagram} onChange={setInstagram} placeholder="@suabarbearia" />
                <FieldGroup label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
                <div className="sm:col-span-2">
                  <FieldGroup label="Descrição" value={description} onChange={setDescription} placeholder="Uma breve descrição" />
                </div>
              </div>
              <SaveButton saving={saving} onClick={saveBarbershop} label="Salvar alterações" />
            </CardSection>
          </TabsContent>

          {/* SERVICES */}
          <TabsContent value="services">
            <CardSection className="space-y-5">
              <div className="flex items-center justify-between">
                <SectionTitle>Serviços ({services.length})</SectionTitle>
                <Button size="sm" onClick={() => setShowNewService(true)} className="rounded-xl">
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>

              {showNewService && (
                <div className="border border-primary/20 rounded-xl p-4 bg-accent/30 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Nome *" value={newServiceName} onChange={setNewServiceName} placeholder="Ex: Corte + Barba" />
                    <FieldGroup label="Categoria" value={newServiceCategory} onChange={setNewServiceCategory} placeholder="Ex: Corte" />
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Duração (min)</Label>
                      <Input type="number" value={newServiceDuration} onChange={(e) => setNewServiceDuration(Number(e.target.value))} className="bg-card" />
                    </div>
                    <FieldGroup label="Preço (R$)" value={newServicePrice} onChange={setNewServicePrice} placeholder="50.00" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addService} className="rounded-xl">Salvar</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowNewService(false)}>Cancelar</Button>
                  </div>
                </div>
              )}

              {services.length === 0 ? (
                <EmptyState text="Nenhum serviço cadastrado." />
              ) : (
                <div className="space-y-2">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                        s.active ? "border-border hover:border-primary/20" : "border-border/50 opacity-50"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {s.duration_minutes} min · R$ {Number(s.price).toFixed(2)}{s.category ? ` · ${s.category}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={s.active} onCheckedChange={() => toggleService(s.id, s.active)} />
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteService(s.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardSection>
          </TabsContent>

          {/* PROFESSIONALS */}
          <TabsContent value="professionals">
            <CardSection className="space-y-5">
              <div className="flex items-center justify-between">
                <SectionTitle>Profissionais ({professionals.length})</SectionTitle>
                <Button size="sm" onClick={() => setShowNewPro(true)} className="rounded-xl">
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>

              {showNewPro && (
                <div className="border border-primary/20 rounded-xl p-4 bg-accent/30 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Nome *" value={newProName} onChange={setNewProName} placeholder="Nome do profissional" />
                    <FieldGroup label="Função" value={newProRole} onChange={setNewProRole} placeholder="Barbeiro" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addProfessional} className="rounded-xl">Salvar</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowNewPro(false)}>Cancelar</Button>
                  </div>
                </div>
              )}

              {professionals.length === 0 ? (
                <EmptyState text="Nenhum profissional cadastrado." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {professionals.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm">
                          {p.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.role}</p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteProfessional(p.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardSection>
          </TabsContent>

          {/* SCHEDULE */}
          <TabsContent value="schedule">
            <div className="space-y-5">
              <CardSection className="space-y-4">
                <SectionTitle>Horário de funcionamento</SectionTitle>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Abertura</Label>
                    <Input type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} className="bg-card" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Fechamento</Label>
                    <Input type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} className="bg-card" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Intervalo (min)</Label>
                    <Input type="number" value={slotInterval} onChange={(e) => setSlotInterval(Number(e.target.value))} className="bg-card" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Buffer (min)</Label>
                    <Input type="number" value={bufferMinutes} onChange={(e) => setBufferMinutes(Number(e.target.value))} className="bg-card" />
                  </div>
                </div>
                <SaveButton saving={saving} onClick={saveBarbershop} label="Salvar" />
              </CardSection>

              <CardSection className="space-y-4">
                <div className="flex items-center justify-between">
                  <SectionTitle>Bloqueios de horário</SectionTitle>
                  <Button size="sm" onClick={() => setShowNewBlock(true)} className="rounded-xl">
                    <Plus className="h-4 w-4 mr-1" /> Novo bloqueio
                  </Button>
                </div>

                {showNewBlock && (
                  <div className="border border-primary/20 rounded-xl p-4 bg-accent/30 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Data *</Label>
                        <Input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} className="bg-card" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Profissional</Label>
                        <select
                          value={blockProId}
                          onChange={(e) => setBlockProId(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Todos</option>
                          {professionals.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={blockAllDay} onCheckedChange={setBlockAllDay} />
                      <Label className="text-xs font-medium text-muted-foreground">Dia inteiro</Label>
                    </div>
                    {!blockAllDay && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">Início</Label>
                          <Input type="time" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} className="bg-card" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">Fim</Label>
                          <Input type="time" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} className="bg-card" />
                        </div>
                      </div>
                    )}
                    <FieldGroup label="Motivo" value={blockReason} onChange={setBlockReason} placeholder="Ex: Almoço, Folga" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addBlockedTime} className="rounded-xl">Salvar</Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowNewBlock(false)}>Cancelar</Button>
                    </div>
                  </div>
                )}

                {blockedTimes.length === 0 ? (
                  <EmptyState text="Nenhum bloqueio configurado." />
                ) : (
                  <div className="space-y-2">
                    {blockedTimes.map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {b.date} {b.all_day ? "(dia inteiro)" : `${b.start_time?.slice(0, 5)} - ${b.end_time?.slice(0, 5)}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {b.reason || "Sem motivo"} {b.professional_id ? `· ${professionals.find((p) => p.id === b.professional_id)?.name || ""}` : "· Todos"}
                          </p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteBlock(b.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardSection>
            </div>
          </TabsContent>

          {/* SUBSCRIPTION */}
          <TabsContent value="subscription">
            <SubscriptionManager />
          </TabsContent>

          {/* WHATSAPP SETTINGS */}
          <TabsContent value="whatsapp">
            <WhatsAppSettingsPanel />
          </TabsContent>

          {/* PREFERENCES */}
          <TabsContent value="preferences">
            <CardSection className="space-y-6">
              <SectionTitle>Preferências de agendamento</SectionTitle>
              <div className="space-y-4">
                <PreferenceRow
                  title="Confirmação automática"
                  description="Confirmar agendamentos automaticamente"
                  checked={autoConfirm}
                  onChange={setAutoConfirm}
                />
                <PreferenceRow
                  title="Cancelamento online"
                  description="Permitir que clientes cancelem pelo link"
                  checked={allowCancel}
                  onChange={setAllowCancel}
                />
                <PreferenceRow
                  title="Remarcação online"
                  description="Permitir que clientes remarquem pelo link"
                  checked={allowReschedule}
                  onChange={setAllowReschedule}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Limite para cancelar (horas antes)</Label>
                    <Input type="number" value={cancelLimit} onChange={(e) => setCancelLimit(Number(e.target.value))} className="bg-card" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Antecedência mínima (horas)</Label>
                    <Input type="number" value={minAdvance} onChange={(e) => setMinAdvance(Number(e.target.value))} className="bg-card" />
                  </div>
                </div>
              </div>
              <SaveButton saving={saving} onClick={saveBarbershop} label="Salvar preferências" />
            </CardSection>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

/* ---- Shared sub-components ---- */

function FieldGroup({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-card" />
    </div>
  );
}

function SaveButton({ saving, onClick, label }: { saving: boolean; onClick: () => void; label: string }) {
  return (
    <Button size="sm" onClick={onClick} disabled={saving} className="rounded-xl">
      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
      {label}
    </Button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-10 rounded-xl bg-muted/30 border border-border/50">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function PreferenceRow({ title, description, checked, onChange }: {
  title: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
