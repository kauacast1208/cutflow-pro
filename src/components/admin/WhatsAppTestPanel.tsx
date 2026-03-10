import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { sendWhatsApp } from "@/services/whatsapp";
import { Loader2, Send, CheckCircle2, XCircle } from "lucide-react";

export default function WhatsAppTestPanel() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    "Olá! 👋 Este é um teste do CutFlow. Se você recebeu esta mensagem, a integração WhatsApp está funcionando! ✅"
  );
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string; messageId?: string } | null>(null);

  const handleSend = async () => {
    if (!phone.trim()) return;
    setSending(true);
    setResult(null);
    const res = await sendWhatsApp(phone.trim(), message);
    setResult(res);
    setSending(false);
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          Teste WhatsApp (Z-API)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Telefone (com DDD)</Label>
          <Input
            placeholder="11999999999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Mensagem</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-1 resize-none"
          />
        </div>
        <Button onClick={handleSend} disabled={sending || !phone.trim()} className="w-full gap-2">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Enviar teste
        </Button>

        {result && (
          <div className={`rounded-lg p-3 text-sm flex items-start gap-2 ${result.success ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300" : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300"}`}>
            {result.success ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 mt-0.5 shrink-0" />}
            <div>
              {result.success ? (
                <p>Mensagem enviada! ID: <code className="text-xs">{result.messageId}</code></p>
              ) : (
                <p>Falha: {result.error}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
