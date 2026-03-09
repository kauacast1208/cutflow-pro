import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";

export default function AdminTopbar() {
  const { barbershop } = useBarbershop();
  const { daysRemaining, subscription } = useSubscription();
  const isTrial = subscription?.status === "trial";

  return (
    <header className="h-16 flex items-center justify-between border-b border-border px-4 sm:px-6 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
        <div className="h-5 w-px bg-border" />
        <h1
          className="text-lg font-semibold tracking-tight text-foreground truncate max-w-[200px] sm:max-w-none"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {barbershop?.name || "CutFlow"}
        </h1>
        {isTrial && daysRemaining !== null && (
          <Badge
            variant="secondary"
            className="hidden sm:inline-flex text-[10px] font-medium bg-accent text-accent-foreground"
          >
            {daysRemaining}d restantes no trial
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        </Button>
      </div>
    </header>
  );
}
