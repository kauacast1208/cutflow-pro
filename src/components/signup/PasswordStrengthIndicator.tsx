import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { score, label, color } = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;

    if (s <= 1) return { score: 1, label: "Fraca", color: "bg-destructive" };
    if (s <= 2) return { score: 2, label: "Razoável", color: "bg-amber-500" };
    if (s <= 3) return { score: 3, label: "Boa", color: "bg-amber-400" };
    if (s <= 4) return { score: 4, label: "Forte", color: "bg-primary" };
    return { score: 5, label: "Excelente", color: "bg-primary" };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i <= score ? color : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className={cn("text-[11px] transition-colors", score <= 1 ? "text-destructive" : "text-muted-foreground")}>
        Força da senha: {label}
      </p>
    </div>
  );
}
