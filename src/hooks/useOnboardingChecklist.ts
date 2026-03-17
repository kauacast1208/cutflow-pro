import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBarbershop } from "./useBarbershop";

export interface OnboardingStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  route?: string;
}

export function useOnboardingChecklist() {
  const { barbershop } = useBarbershop();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const check = useCallback(async () => {
    if (!barbershop) {
      setLoading(false);
      return;
    }

    // Check dismissed state from localStorage
    const key = `onboarding_dismissed_${barbershop.id}`;
    if (localStorage.getItem(key) === "true") {
      setDismissed(true);
      setLoading(false);
      return;
    }

    const [servicesRes, professionalsRes, availabilityRes] = await Promise.all([
      supabase
        .from("services")
        .select("id", { count: "exact" })
        .eq("barbershop_id", barbershop.id)
        .eq("active", true),
      supabase
        .from("professionals")
        .select("id", { count: "exact" })
        .eq("barbershop_id", barbershop.id)
        .eq("is_active", true),
      supabase
        .from("professional_availability")
        .select("id", { count: "exact" })
        .in(
          "professional_id",
          // subquery via separate call
          []
        ),
    ]);

    // For availability, we need professional ids first
    const proIds = professionalsRes.data?.map((p) => p.id) || [];
    let availCount = 0;
    if (proIds.length > 0) {
      const { count } = await supabase
        .from("professional_availability")
        .select("id", { count: "exact", head: true })
        .in("professional_id", proIds);
      availCount = count || 0;
    }

    const hasProfile =
      !!barbershop.name &&
      !!barbershop.phone &&
      !!barbershop.address;

    const hasService = (servicesRes.count || 0) > 0;
    const hasProfessional = (professionalsRes.count || 0) > 0;
    const hasAvailability = availCount > 0;

    const newSteps: OnboardingStep[] = [
      {
        id: "profile",
        label: "Completar perfil da barbearia",
        description: "Nome, telefone e endereço",
        completed: hasProfile,
        route: "/dashboard/settings",
      },
      {
        id: "service",
        label: "Criar primeiro serviço",
        description: "Ex: Corte masculino, Barba, Sobrancelha",
        completed: hasService,
        route: "/dashboard/services",
      },
      {
        id: "professional",
        label: "Adicionar primeiro profissional",
        description: "Cadastre quem vai atender",
        completed: hasProfessional,
        route: "/dashboard/professionals",
      },
      {
        id: "availability",
        label: "Definir horários de trabalho",
        description: "Configure a disponibilidade dos profissionais",
        completed: hasAvailability,
        route: "/dashboard/professionals",
      },
      {
        id: "share_link",
        label: "Copiar link público de agendamento",
        description: `cutflow.app/b/${barbershop.slug}`,
        completed: false, // This is an action, always available
        route: undefined,
      },
    ];

    setSteps(newSteps);
    setLoading(false);
  }, [barbershop]);

  useEffect(() => {
    check();
  }, [check]);

  const completedCount = steps.filter((s) => s.completed).length;
  // share_link doesn't count towards completion requirement
  const actionableSteps = steps.filter((s) => s.id !== "share_link");
  const allDone = actionableSteps.length > 0 && actionableSteps.every((s) => s.completed);
  const progress = actionableSteps.length > 0
    ? Math.round((actionableSteps.filter((s) => s.completed).length / actionableSteps.length) * 100)
    : 0;

  const dismiss = () => {
    if (barbershop) {
      localStorage.setItem(`onboarding_dismissed_${barbershop.id}`, "true");
    }
    setDismissed(true);
  };

  return {
    steps,
    loading,
    completedCount,
    progress,
    allDone,
    dismissed,
    dismiss,
    refresh: check,
  };
}
