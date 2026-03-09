import { Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { getMinPlanForFeature, planConfig, type PlanFeature } from "@/lib/plans";

interface UpgradeBannerProps {
  feature: PlanFeature;
  title: string;
  description: string;
}

export function UpgradeBanner({ feature, title, description }: UpgradeBannerProps) {
  const navigate = useNavigate();
  const minPlan = getMinPlanForFeature(feature);
  const planLabel = planConfig[minPlan].label;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <CardContent className="flex flex-col items-center text-center py-16 px-8 space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Crown className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
        <Button onClick={() => navigate("/checkout")} className="gap-2">
          Upgrade para {planLabel} <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
