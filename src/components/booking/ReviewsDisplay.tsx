import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReviewsDisplayProps {
  barbershopId: string;
}

export function ReviewsDisplay({ barbershopId }: ReviewsDisplayProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any)
      .from("reviews")
      .select("*")
      .eq("barbershop_id", barbershopId)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }: any) => {
        setReviews(data || []);
        setLoading(false);
      });
  }, [barbershopId]);

  if (loading || reviews.length === 0) return null;

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Avaliações</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`} />
            ))}
          </div>
          <span className="text-xs font-semibold text-foreground">{avgRating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({reviews.length})</span>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.slice(0, 4).map((review) => (
          <div key={review.id} className="rounded-xl bg-accent/30 border border-border/50 p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                  {review.client_name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-foreground">{review.client_name}</span>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`h-3 w-3 ${i <= review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`} />
                ))}
              </div>
            </div>
            {review.comment && (
              <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>
            )}
            <p className="text-[10px] text-muted-foreground/50 mt-1.5">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
