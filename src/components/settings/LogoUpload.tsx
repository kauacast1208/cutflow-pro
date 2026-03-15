import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2, Scissors, ImageIcon } from "lucide-react";

export default function LogoUpload() {
  const { barbershop, setBarbershop } = useBarbershop();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !barbershop) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Formato inválido", description: "Envie uma imagem (PNG, JPG ou WebP).", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "O logo deve ter no máximo 2MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${barbershop.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
    const logoUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { data, error } = await supabase
      .from("barbershops")
      .update({ logo_url: logoUrl })
      .eq("id", barbershop.id)
      .select()
      .single();

    setUploading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setBarbershop(data);
      toast({ title: "Logo atualizado!", description: "Seu novo logo já está visível." });
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRemove = async () => {
    if (!barbershop) return;
    setRemoving(true);

    // Remove from storage (best-effort)
    await supabase.storage.from("logos").remove([`${barbershop.id}/logo.png`, `${barbershop.id}/logo.jpg`, `${barbershop.id}/logo.webp`]);

    const { data, error } = await supabase
      .from("barbershops")
      .update({ logo_url: null })
      .eq("id", barbershop.id)
      .select()
      .single();

    setRemoving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setBarbershop(data);
      toast({ title: "Logo removido" });
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
          <ImageIcon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Logo da barbearia
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Exibido na página de agendamento e no painel administrativo.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Preview */}
        <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
          {barbershop?.logo_url ? (
            <img
              src={barbershop.logo_url}
              alt="Logo"
              className="h-full w-full object-cover rounded-2xl"
            />
          ) : (
            <Scissors className="h-8 w-8 text-muted-foreground/30" />
          )}
        </div>

        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl gap-1.5 text-xs"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? "Enviando..." : "Enviar logo"}
          </Button>

          {barbershop?.logo_url && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl gap-1.5 text-xs text-destructive hover:text-destructive"
              onClick={handleRemove}
              disabled={removing}
            >
              {removing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Remover
            </Button>
          )}

          <p className="text-[11px] text-muted-foreground/60">PNG, JPG ou WebP · Máx. 2MB</p>
        </div>
      </div>
    </div>
  );
}
