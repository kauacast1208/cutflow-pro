import { Scissors, CalendarCheck, Bell, BarChart3, LayoutDashboard, TrendingDown, ShieldCheck, Chrome, CreditCard } from "lucide-react";

const features = [
  { icon: CalendarCheck, label: "Agenda inteligente" },
  { icon: Bell, label: "Lembretes automáticos WhatsApp" },
  { icon: BarChart3, label: "Controle financeiro" },
  { icon: LayoutDashboard, label: "Dashboard profissional" },
  { icon: TrendingDown, label: "Redução de faltas" },
];

const trustBadges = [
  { icon: ShieldCheck, label: "SSL Seguro" },
  { icon: Chrome, label: "Login Google" },
  { icon: CreditCard, label: "Sem cartão" },
];

export function SignupBrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-[48%] relative items-center justify-center p-12 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[linear-gradient(145deg,hsl(152,58%,18%)_0%,hsl(152,48%,14%)_40%,hsl(160,45%,22%)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,hsl(152,60%,30%/0.4)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,hsl(160,50%,35%/0.2)_0%,transparent_50%)]" />
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\'%3E%3Cpath d=\'M0 0h1v40H0zM40 0v1H0V0z\'/%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative z-10 max-w-md w-full">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Scissors className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">CutFlow</span>
        </div>

        {/* Headline */}
        <h1 className="text-[2rem] leading-[1.15] font-bold text-white mb-3 tracking-tight">
          Transforme sua barbearia em uma máquina de agendamentos.
        </h1>
        <p className="text-white/60 text-base leading-relaxed mb-8">
          Gerencie clientes, agenda e faturamento em um único sistema.
        </p>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 group">
              <div className="h-8 w-8 rounded-lg bg-white/[0.08] flex items-center justify-center shrink-0 group-hover:bg-white/[0.12] transition-colors">
                <Icon className="h-4 w-4 text-emerald-300" />
              </div>
              <span className="text-white/80 text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="bg-white/[0.06] backdrop-blur-sm rounded-2xl p-5 mb-8 border border-white/[0.06]">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 border-2 border-[hsl(152,48%,14%)] flex items-center justify-center text-[10px] font-bold text-white">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              ))}
            </div>
          </div>
          <p className="text-white/70 text-sm">
            <span className="text-white font-semibold">+200 barbeiros</span> organizando seus negócios com CutFlow
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-4">
          {trustBadges.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-white/40 text-xs">
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
