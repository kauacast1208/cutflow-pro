import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors, AlertCircle, User, Phone, Mail, ShieldCheck, FileText } from "lucide-react";
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

function InputWithIcon({
  id,
  label,
  icon: Icon,
  error,
  ...props
}: ComponentProps<typeof Input> & { label: string; icon: any; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          className={`h-12 rounded-2xl pl-11 text-base ${error ? "border-destructive" : ""}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      ) : null}
    </div>
  );
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
  const phoneDigits = clientPhone.replace(/\D/g, "");
  const nameLen = clientName.trim().length;
  const showNameError = nameLen > 0 && nameLen < 2;
  const showPhoneError = phoneDigits.length > 0 && phoneDigits.length < 10;
  const showEmailError = clientEmail.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Seus dados para confirmar</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Formulario simples, seguro e otimizado para celular.
        </p>
      </div>

      <div className="rounded-[24px] border border-border/60 bg-background/70 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Scissors className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{service?.name} com {professional?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {selectedDate && format(selectedDate, "EEE, dd MMM", { locale: ptBR })} as {selectedTime}
                </p>
              </div>
              <p className="text-lg font-extrabold tracking-tight text-primary">{formatCurrency(Number(service?.price || 0))}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-[24px] border border-border/60 bg-background/70 p-4 shadow-sm sm:p-5">
        <InputWithIcon
          id="clientName"
          label="Nome completo *"
          icon={User}
          placeholder="Seu nome completo"
          value={clientName}
          onChange={(e) => onChangeName(e.target.value)}
          maxLength={100}
          error={showNameError ? "Digite pelo menos 2 caracteres." : undefined}
        />

        <InputWithIcon
          id="clientPhone"
          label="WhatsApp / telefone *"
          icon={Phone}
          placeholder="(11) 99999-0000"
          value={clientPhone}
          onChange={(e) => onChangePhone(formatPhone(e.target.value))}
          inputMode="tel"
          maxLength={16}
          error={showPhoneError ? "Digite um telefone valido." : undefined}
        />

        <InputWithIcon
          id="clientEmail"
          type="email"
          label="E-mail (opcional)"
          icon={Mail}
          placeholder="voce@email.com"
          value={clientEmail}
          onChange={(e) => onChangeEmail(e.target.value)}
          inputMode="email"
          maxLength={255}
          error={showEmailError ? "Digite um e-mail valido." : undefined}
        />

        <div className="space-y-1.5">
          <Label htmlFor="clientNotes" className="text-sm font-medium">Observacoes (opcional)</Label>
          <div className="relative">
            <FileText className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-muted-foreground" />
            <textarea
              id="clientNotes"
              placeholder="Preferencias, referencia de corte ou observacoes para o atendimento."
              value={clientNotes}
              onChange={(e) => onChangeNotes(e.target.value)}
              rows={4}
              maxLength={500}
              className="flex w-full rounded-2xl border border-input bg-background px-11 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:border-primary/50"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-primary/15 bg-primary/[0.05] p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Privacidade e confianca</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Usamos seus dados somente para confirmar a reserva, enviar lembretes e facilitar o atendimento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
