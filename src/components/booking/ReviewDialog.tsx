import { useState } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface ReviewDialogProps {
  barbershopId: string;
  appointmentId?: string | null;
  professionalId?: string | null;
  clientName: string;
  clientPhone?: string;
  onSubmitted: () => void;
}

export function ReviewDialog({
  barbershopId,
  appointmentId,
  professionalId,
  clientName,
  clientPhone,
  onSubmitted,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    await (supabase as any).from("reviews").insert({
      barbershop_id: barbershopId,
      appointment_id: appointmentId || null,
      professional_id: professionalId || null,
      client_name: clientName,
      client_phone: clientPhone || null,
      rating,
      comment: comment.trim() || null,
    });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(onSubmitted, 1500);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center"
      >
        <div className="flex justify-center mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className={`h-5 w-5 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`} />
          ))}
        </div>
        <p className="text-sm font-semibold text-foreground">Obrigado pela avaliação!</p>
        <p className="text-xs text-muted-foreground mt-1">Sua opinião é muito importante para nós.</p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">Como foi sua experiência?</p>
        <p className="text-xs text-muted-foreground mt-0.5">Deixe sua avaliação</p>
      </div>

      <div className="flex justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            onMouseEnter={() => setHoveredRating(i)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(i)}
            className="p-1 transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                i <= (hoveredRating || rating)
                  ? "text-amber-400 fill-amber-400"
                  : "text-muted-foreground/20"
              }`}
            />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
          <textarea
            placeholder="Conte como foi o atendimento (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            rows={3}
            maxLength={500}
            className="flex w-full rounded-xl border border-input bg-background px-3 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-xl h-11 font-semibold"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Enviar avaliação
          </Button>
        </motion.div>
      )}
    </div>
  );
}
