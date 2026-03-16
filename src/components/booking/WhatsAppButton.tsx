import { useState } from "react";
import { CUTFLOW_WHATSAPP, whatsAppClickHandler } from "@/lib/whatsappCTA";

const DEFAULT_MESSAGE = "Olá! Gostaria de saber mais sobre o sistema CutFlow para minha barbearia.";

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip */}
      <span
        className={`rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-medium text-foreground shadow-md transition-all duration-200 whitespace-nowrap ${
          hovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
        }`}
      >
        Fale conosco
      </span>

      {/* Button */}
      <button
        onClick={whatsAppClickHandler(CUTFLOW_WHATSAPP, DEFAULT_MESSAGE)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        aria-label="Contato via WhatsApp"
      >
        {/* Official WhatsApp SVG icon */}
        <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.502 1.14 6.746 3.072 9.382L1.062 31.18l5.964-1.972A15.924 15.924 0 0016.004 32C24.826 32 32 24.826 32 16.004 32 7.176 24.826 0 16.004 0zm9.318 22.608c-.396 1.116-1.956 2.04-3.204 2.31-.852.18-1.968.324-5.718-1.23-4.8-1.986-7.89-6.852-8.13-7.17-.228-.318-1.92-2.556-1.92-4.878 0-2.322 1.218-3.462 1.65-3.936.396-.432.924-.612 1.232-.612.15 0 .282.006.402.012.432.018.648.042.936.726.36.852 1.236 3.012 1.344 3.228.108.216.216.504.072.798-.132.3-.252.432-.468.684-.216.252-.42.444-.636.714-.198.234-.42.486-.174.918.246.426 1.092 1.8 2.346 2.916 1.614 1.434 2.976 1.884 3.396 2.088.432.204.684.174.936-.108.258-.288 1.104-1.284 1.398-1.728.288-.444.582-.366.978-.216.402.144 2.544 1.2 2.976 1.416.432.222.72.33.828.516.108.186.108 1.074-.288 2.19z" />
        </svg>
      </button>
    </div>
  );
}
