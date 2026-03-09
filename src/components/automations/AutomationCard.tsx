import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, ChevronDown, MessageSquare, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface AutomationType {
  type: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  iconBg: string;
  defaultConfig: Record<string, any>;
}

export interface Automation {
  id?: string;
  type: string;
  enabled: boolean;
  config: any;
}

interface AutomationCardProps {
  at: AutomationType;
  automation: Automation;
  isExpanded: boolean;
  saving: string | null;
  onToggle: () => void;
  onExpand: () => void;
  onUpdateConfig: (key: string, value: any) => void;
  onSave: () => void;
}

export default function AutomationCard({
  at,
  automation,
  isExpanded,
  saving,
  onToggle,
  onExpand,
  onUpdateConfig,
  onSave,
}: AutomationCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl border border-border/60 bg-card overflow-hidden transition-shadow hover:shadow-[var(--shadow-md)]"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer transition-colors"
        onClick={onExpand}
      >
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl ${at.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}>
            <at.icon className={`h-5 w-5 ${at.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-semibold text-sm text-foreground">{at.title}</h3>
              {automation.enabled && (
                <Badge className="bg-success/10 text-success border-0 text-[10px] font-medium px-2 py-0.5 rounded-full">
                  Ativa
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{at.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={automation.enabled}
              onCheckedChange={onToggle}
              disabled={saving === at.type}
            />
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground/50 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Expandable Config */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 p-6 space-y-5 bg-secondary/20">
              {/* Message */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Mensagem
                </Label>
                <Textarea
                  rows={4}
                  value={automation.config?.message || ""}
                  onChange={(e) => onUpdateConfig("message", e.target.value)}
                  className="text-sm bg-card border-border/60 resize-none focus:ring-primary/20"
                />
                <p className="text-[11px] text-muted-foreground/70">
                  Variáveis: <code className="text-primary/80 bg-primary/5 px-1 rounded">{"{{nome}}"}</code>,{" "}
                  <code className="text-primary/80 bg-primary/5 px-1 rounded">{"{{link}}"}</code>
                  {at.type === "referral_reward" && (
                    <>
                      , <code className="text-primary/80 bg-primary/5 px-1 rounded">{"{{meta}}"}</code>,{" "}
                      <code className="text-primary/80 bg-primary/5 px-1 rounded">{"{{recompensa}}"}</code>
                    </>
                  )}
                </p>
              </div>

              {/* Channel & Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Canal de envio
                  </Label>
                  <div className="flex gap-2">
                    {[
                      { key: "whatsapp", label: "WhatsApp", icon: MessageSquare },
                      { key: "email", label: "E-mail", icon: Mail },
                    ].map((ch) => (
                      <Button
                        key={ch.key}
                        size="sm"
                        variant={automation.config?.channel === ch.key ? "default" : "outline"}
                        onClick={() => onUpdateConfig("channel", ch.key)}
                        className={`text-xs gap-1.5 rounded-lg ${
                          automation.config?.channel === ch.key
                            ? ""
                            : "border-border/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <ch.icon className="h-3.5 w-3.5" />
                        {ch.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {at.type === "inactive_client" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Dias de inatividade
                    </Label>
                    <Input
                      type="number"
                      min={7}
                      max={90}
                      value={automation.config?.days_threshold || 30}
                      onChange={(e) => onUpdateConfig("days_threshold", Number(e.target.value))}
                      className="w-28 bg-card border-border/60"
                    />
                  </div>
                )}

                {at.type === "post_service" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Enviar após (horas)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={48}
                      value={automation.config?.delay_hours || 2}
                      onChange={(e) => onUpdateConfig("delay_hours", Number(e.target.value))}
                      className="w-28 bg-card border-border/60"
                    />
                  </div>
                )}
              </div>

              {/* Save */}
              <div className="pt-1">
                <Button
                  size="sm"
                  onClick={onSave}
                  disabled={saving === at.type}
                  className="rounded-lg gap-1.5"
                >
                  {saving === at.type ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Salvar configuração
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
