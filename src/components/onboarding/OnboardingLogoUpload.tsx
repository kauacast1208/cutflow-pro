import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingLogoUploadProps {
  barbershopId?: string | null;
  logoUrl: string | null;
  onLogoChange: (url: string | null) => void;
}

export default function OnboardingLogoUpload({ barbershopId, logoUrl, onLogoChange }: OnboardingLogoUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Formato inválido", description: "Envie PNG, JPG ou WebP.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 2MB.", variant: "destructive" });
      return;
    }

    // If we already have a barbershopId, upload to storage
    if (barbershopId) {
      setUploading(true);
      const ext = file.name.split(".").pop() || "png";
      const path = `${barbershopId}/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
      const url = `${urlData.publicUrl}?t=${Date.now()}`;
      onLogoChange(url);
      setUploading(false);
    } else {
      // Preview locally before barbershop creation
      const reader = new FileReader();
      reader.onload = () => onLogoChange(reader.result as string);
      reader.readAsDataURL(file);
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">Logo (opcional)</label>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center overflow-hidden shrink-0 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-full w-full object-cover rounded-2xl" />
          ) : (
            <Scissors className="h-6 w-6 text-muted-foreground/40" />
          )}
        </button>

        <div className="space-y-1.5">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl gap-1.5 text-xs h-8"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? "Enviando..." : logoUrl ? "Trocar logo" : "Enviar logo"}
          </Button>
          <p className="text-[11px] text-muted-foreground/60">PNG, JPG ou WebP · Máx. 2MB</p>
        </div>
      </div>
    </div>
  );
}
