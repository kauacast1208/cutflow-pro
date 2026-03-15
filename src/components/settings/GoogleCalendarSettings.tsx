import { useState } from "react";
import { Calendar, Check, ExternalLink, RefreshCw, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function GoogleCalendarSettings() {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const isConnected = false; // future: check real connection status

  return (
    <div className="space-y-6">
      {/* Google Calendar Card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Google Calendar
              </h3>
              {isConnected ? (
                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-[10px]">
                  <Check className="h-3 w-3 mr-1" /> Conectado
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px]">
                  Desconectado
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Sincronize automaticamente os agendamentos do CutFlow com o Google Calendar.
            </p>
          </div>
        </div>

        {!isConnected ? (
          <div className="rounded-xl bg-muted/50 border border-border/60 p-5 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Como funciona:</p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <Check className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                  Agendamentos confirmados aparecem automaticamente na sua agenda Google
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                  Cancelamentos removem o evento do Google Calendar
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                  Receba notificações do Google antes de cada agendamento
                </li>
              </ul>
            </div>
            <Button className="rounded-xl gap-2" disabled>
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Conectar Google Calendar
            </Button>
            <p className="text-[11px] text-muted-foreground/70">
              Em breve disponível. Estamos preparando esta integração para você.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div>
                <p className="text-sm font-medium text-foreground">Sincronizar agendamentos</p>
                <p className="text-xs text-muted-foreground">Criar eventos automaticamente no Google Calendar</p>
              </div>
              <Switch checked={syncEnabled} onCheckedChange={setSyncEnabled} />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div>
                <p className="text-sm font-medium text-foreground">Conta conectada</p>
                <p className="text-xs text-muted-foreground">usuario@gmail.com</p>
              </div>
              <Button size="sm" variant="ghost" className="text-xs h-8 gap-1.5 text-destructive hover:text-destructive">
                <Unplug className="h-3 w-3" /> Desconectar
              </Button>
            </div>

            <Button size="sm" variant="outline" className="rounded-xl gap-1.5 text-xs">
              <RefreshCw className="h-3 w-3" /> Sincronizar agora
            </Button>
          </div>
        )}
      </div>

      {/* Future integrations placeholder */}
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center space-y-2">
        <ExternalLink className="h-5 w-5 text-muted-foreground/40 mx-auto" />
        <p className="text-sm font-medium text-muted-foreground/60">Mais integrações em breve</p>
        <p className="text-xs text-muted-foreground/40">Apple Calendar, Outlook e outros</p>
      </div>
    </div>
  );
}
