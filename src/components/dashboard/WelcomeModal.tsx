import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const WELCOME_KEY = "cutflow_welcome_shown";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem(WELCOME_KEY)) {
      const timer = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(WELCOME_KEY, "1");
    setOpen(false);
  };

  const start = () => {
    dismiss();
    navigate("/dashboard/services");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-8 relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto mb-6"
            >
              <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-primary/10">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg">
                  <Sparkles className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>
            </motion.div>

            <h2 className="text-2xl font-extrabold tracking-tight mb-2">
              Bem-vindo ao CutFlow! 🎉
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Vamos configurar sua barbearia em menos de 2 minutos.
              <br />
              Comece adicionando seus serviços e profissionais.
            </p>

            <Button onClick={start} className="w-full rounded-xl h-12 font-semibold text-base">
              Começar configuração
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <button
              onClick={dismiss}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Já conheço, pular
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
