import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors } from "lucide-react";
import { formatPhone, formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientInfoStepProps {
  service: any;
  professional: any;
  selectedDate: Date | undefined;
  selectedTime: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientNotes: string;
  onChangeName: (v: string) => void;
  onChangePhone: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangeNotes: (v: string) => void;
}

export function ClientInfoStep({
  service,
  professional,
  selectedDate,
  selectedTime,
  clientName,
  clientPhone,
  clientEmail,
  clientNotes,
  onChangeName,
  onChangePhone,
  onChangeEmail,
  onChangeNotes,
}: ClientInfoStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl sm:text-2xl font-bold mb-1">Seus dados</h2>
      <p className="text-muted-foreground text-sm mb-5">Informe seus dados para finalizar.</p>

      {/* Booking summary mini */}
      <div className="rounded-xl bg-accent/50 border border-border p-3 flex items-center gap-3 mb-6 text-xs">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
          <Scissors className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{service?.name} com {professional?.name}</p>
          <p className="text-muted-foreground capitalize">
            {selectedDate && format(selectedDate, "EEE, dd MMM", { locale: ptBR })} às {selectedTime}
          </p>
        </div>
        <span className="font-bold text-primary text-sm shrink-0">{formatCurrency(Number(service?.price || 0))}</span>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="clientName" className="text-sm font-medium">Nome completo *</Label>
          <Input
            id="clientName"
            placeholder="Seu nome completo"
            value={clientName}
            onChange={(e) => onChangeName(e.target.value)}
            className="h-12 rounded-xl text-base"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="clientPhone" className="text-sm font-medium">Telefone *</Label>
          <Input
            id="clientPhone"
            placeholder="(11) 99999-0000"
            value={clientPhone}
            onChange={(e) => onChangePhone(formatPhone(e.target.value))}
            className="h-12 rounded-xl text-base"
            inputMode="tel"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="clientEmail" className="text-sm font-medium">E-mail (opcional)</Label>
          <Input
            id="clientEmail"
            type="email"
            placeholder="seu@email.com"
            value={clientEmail}
            onChange={(e) => onChangeEmail(e.target.value)}
            className="h-12 rounded-xl text-base"
            inputMode="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="clientNotes" className="text-sm font-medium">Observações (opcional)</Label>
          <textarea
            id="clientNotes"
            placeholder="Alguma preferência?"
            value={clientNotes}
            onChange={(e) => onChangeNotes(e.target.value)}
            rows={2}
            className="flex w-full rounded-xl border border-input bg-background px-3 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>
    </div>
  );
}
