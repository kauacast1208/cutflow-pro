import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Link2,
  Trophy,
  TrendingUp,
  Copy,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface AmbassadorData {
  id: string;
  referral_code: string;
  referral_link: string;
  status: string;
  total_invites: number;
  total_conversions: number;
  total_rewards_earned: number;
}

interface LeadRow {
  id: string;
  referred_email: string | null;
  referred_name: string | null;
  status: string;
  created_at: string;
  reward_amount: number | null;
  reward_status: string | null;
}

export default function AmbassadorPage() {
  const { user } = useAuth();
  const [ambassador, setAmbassador] = useState<AmbassadorData | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("platform_ambassadors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setAmbassador(data as unknown as AmbassadorData);

        const { data: leadsData } = await supabase
          .from("platform_referral_leads")
          .select("*")
          .eq("ambassador_id", data.id)
          .order("created_at", { ascending: false });

        if (leadsData) setLeads(leadsData as unknown as LeadRow[]);
      }
      setLoading(false);
    })();
  }, [user]);

  const handleCopy = async () => {
    if (!ambassador) return;
    await navigator.clipboard.writeText(ambassador.referral_link);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const statusLabel: Record<string, string> = {
    invited: "Convidado",
    signed_up: "Cadastrado",
    converted: "Convertido",
    churned: "Inativo",
  };

  const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
    invited: "outline",
    signed_up: "secondary",
    converted: "default",
    churned: "outline",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!ambassador) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Programa de Embaixadores</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Você ainda não faz parte do nosso programa de embaixadores. 
            Entre em contato com nosso time para saber como participar e ganhar recompensas indicando o CutFlow.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/dashboard">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Voltar ao painel
              </Button>
            </Link>
            <a href="https://wa.me/5511999999999?text=Olá! Tenho interesse no programa de embaixadores do CutFlow." target="_blank" rel="noopener noreferrer">
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" /> Quero ser embaixador
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const conversionRate = ambassador.total_invites > 0
    ? ((ambassador.total_conversions / ambassador.total_invites) * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold">Painel do Embaixador</h1>
              <Badge variant="default" className="text-xs">
                {ambassador.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Acompanhe suas indicações e recompensas do programa CutFlow.
            </p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar ao painel
            </Button>
          </Link>
        </div>

        {/* Referral Link */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.03] via-card to-accent/[0.04]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Seu link de indicação
            </CardTitle>
            <CardDescription>
              Compartilhe este link para convidar novos clientes ao CutFlow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                readOnly
                value={ambassador.referral_link}
                className="font-mono text-sm bg-muted/50"
              />
              <Button onClick={handleCopy} variant="outline" className="shrink-0 gap-2 min-w-[110px]">
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Código: <span className="font-mono font-medium text-foreground">{ambassador.referral_code}</span>
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ambassador.total_invites}</p>
                  <p className="text-xs text-muted-foreground">Convites enviados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ambassador.total_conversions}</p>
                  <p className="text-xs text-muted-foreground">Conversões</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">Taxa de conversão</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    R$ {Number(ambassador.total_rewards_earned).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Recompensas ganhas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Indicações recentes</CardTitle>
            <CardDescription>Histórico das suas indicações ao CutFlow.</CardDescription>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhuma indicação ainda.</p>
                <p className="text-xs mt-1">Compartilhe seu link para começar!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 font-medium">Nome</th>
                      <th className="text-left py-2 font-medium">Email</th>
                      <th className="text-left py-2 font-medium">Status</th>
                      <th className="text-left py-2 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b last:border-0">
                        <td className="py-2.5">{lead.referred_name || "—"}</td>
                        <td className="py-2.5 text-muted-foreground">{lead.referred_email || "—"}</td>
                        <td className="py-2.5">
                          <Badge variant={statusVariant[lead.status] || "outline"} className="text-[11px]">
                            {statusLabel[lead.status] || lead.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
