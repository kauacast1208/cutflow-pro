import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("cutflow-theme");
    if (stored) return stored === "dark";
    return true; // Dark mode is the default
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("cutflow-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className={cn(
        "h-9 w-9 rounded-xl flex items-center justify-center",
        "text-muted-foreground hover:text-foreground hover:bg-accent/50",
        "transition-all duration-200",
        className
      )}
      aria-label={dark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
