import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function MasterLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Logs da Plataforma</h1>
        <p className="text-muted-foreground text-sm">Registro de atividades e eventos do sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Em breve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            O módulo de logs será implementado em breve. Aqui você poderá acompanhar ações administrativas, 
            alterações de plano, suspensões de conta e outros eventos relevantes da plataforma.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
