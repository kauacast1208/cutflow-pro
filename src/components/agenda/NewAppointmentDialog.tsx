import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { format, addMinutes, parse } from "date-fns";


interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionals: any[];
  services: any[];
  defaultDate?: Date;
  defaultTime?: string;
  defaultProfessionalId?: string;
  onCreated: () => void;
}

export default function NewAppointmentDialog({
  open,
  onOpenChange,
  professionals,
  services,
  defaultDate,
  defaultTime,
  defaultProfessionalId,
  onCreated,
}: NewAppointmentDialogProps) {
  const { barbershop } = useBarbershop();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    service_id: "",
    professional_id: "",
    date: "",
    start_time: "",
    notes: "",
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setForm({
        client_name: "",
        client_phone: "",
        client_email: "",
        service_id: services[0]?.id || "",
        professional_id: defaultProfessionalId || professionals[0]?.id || "",
        date: defaultDate ? format(defaultDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        start_time: defaultTime || "09:00",
        notes: "",
      });
    }
  }, [open, defaultDate, defaultTime, defaultProfessionalId, services, professionals]);

  const selectedService = useMemo(
    () => services.find((s: any) => s.id === form.service_id),
    [services, form.service_id]
  );

  const endTime = useMemo(() => {
    if (!form.start_time || !selectedService) return "";
    try {
      const start = parse(form.start_time, "HH:mm", new Date());
      const end = addMinutes(start, selectedService.duration_minutes || 30);
      return format(end, "HH:mm");
    } catch {
      return "";
    }
  }, [form.start_time, selectedService]);

  const handleSubmit = async () => {
    if (!barbershop || !form.client_name || !form.service_id || !form.professional_id || !form.date || !form.start_time) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("appointments").insert({
        barbershop_id: barbershop.id,
        client_name: form.client_name,
        client_phone: form.client_phone || null,
        client_email: form.client_email || null,
        service_id: form.service_id,
        professional_id: form.professional_id,
        date: form.date,
        start_time: form.start_time,
        end_time: endTime,
        price: selectedService?.price || 0,
        notes: form.notes || null,
        status: "scheduled",
      });

      if (error) throw error;

      // Fetch the created appointment ID for notification pipeline
      const { data: createdAppt } = await supabase
        .from("appointments")
        .select("id")
        .eq("barbershop_id", barbershop.id)
        .eq("date", form.date)
        .eq("start_time", form.start_time)
        .eq("professional_id", form.professional_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Trigger full notification pipeline (confirmation + scheduled reminders)
      // Fire-and-forget: never blocks the UI
      if (createdAppt?.id) {
        supabase.functions.invoke("send-booking-confirmation", {
          body: { appointmentId: createdAppt.id },
        }).catch((err) => console.warn("[notifications] pipeline error:", err));
      }

      toast({ title: "Agendamento criado com sucesso!" });
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      toast({
        title: "Erro ao criar agendamento",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Novo agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client */}
          <div>
            <Label className="text-xs font-medium">Cliente *</Label>
            <Input
              placeholder="Nome do cliente"
              value={form.client_name}
              onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
              className="rounded-xl mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Telefone</Label>
              <Input
                placeholder="(11) 99999-9999"
                value={form.client_phone}
                onChange={(e) => setForm((f) => ({ ...f, client_phone: e.target.value }))}
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Email</Label>
              <Input
                placeholder="email@exemplo.com"
                value={form.client_email}
                onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value }))}
                className="rounded-xl mt-1"
              />
            </div>
          </div>

          {/* Service */}
          <div>
            <Label className="text-xs font-medium">Serviço *</Label>
            <Select value={form.service_id} onValueChange={(v) => setForm((f) => ({ ...f, service_id: v }))}>
              <SelectTrigger className="rounded-xl mt-1">
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} - {s.duration_minutes}min · R${Number(s.price).toFixed(0)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Professional */}
          <div>
            <Label className="text-xs font-medium">Profissional *</Label>
            <Select value={form.professional_id} onValueChange={(v) => setForm((f) => ({ ...f, professional_id: v }))}>
              <SelectTrigger className="rounded-xl mt-1">
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Data *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Horário *</Label>
              <Input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                className="rounded-xl mt-1"
              />
              {endTime && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Término: {endTime} ({selectedService?.duration_minutes}min)
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs font-medium">Observações</Label>
            <Textarea
              placeholder="Observações sobre o atendimento..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="rounded-xl mt-1 resize-none"
              rows={2}
            />
          </div>

          {/* Price preview */}
          {selectedService && (
            <div className="rounded-xl bg-accent/40 border border-border/50 p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Valor do serviço</span>
              <span className="text-lg font-bold text-foreground">
                R$ {Number(selectedService.price).toFixed(2)}
              </span>
            </div>
          )}

          <Button
            className="w-full rounded-xl h-11 gap-2"
            onClick={handleSubmit}
            disabled={submitting || !form.client_name || !form.service_id || !form.professional_id}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Criar agendamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


