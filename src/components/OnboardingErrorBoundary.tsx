import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ArrowLeft, Bug } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Error boundary specific to auth/onboarding flows.
 * Shows contextual recovery options and captures diagnostic info.
 */
export class OnboardingErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Structured telemetry log for production debugging
    const diagnostics = {
      timestamp: new Date().toISOString(),
      route: window.location.pathname,
      errorName: error.name,
      errorMessage: error.message,
      componentStack: errorInfo.componentStack?.slice(0, 500),
      userAgent: navigator.userAgent,
      sessionExists: !!localStorage.getItem(`sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`),
    };

    console.error("[OnboardingErrorBoundary] Crash captured:", diagnostics);
    console.error("[OnboardingErrorBoundary] Stack:", error.stack);
  }

  render() {
    if (this.state.hasError) {
      const isAuthRelated =
        this.state.error?.message?.includes("auth") ||
        this.state.error?.message?.includes("session") ||
        this.state.error?.message?.includes("tenant");

      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="text-center max-w-md space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-foreground mb-2">
                {isAuthRelated ? "Erro na autenticação" : "Erro no setup"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isAuthRelated
                  ? "Ocorreu um problema ao verificar sua sessão. Tente fazer login novamente."
                  : "Ocorreu um erro inesperado durante a configuração. Tente recarregar a página."}
              </p>
            </div>

            {/* Error details (dev-friendly) */}
            <details className="text-left rounded-xl border border-border/50 bg-muted/30 p-4">
              <summary className="text-xs font-medium text-muted-foreground cursor-pointer flex items-center gap-1.5">
                <Bug className="h-3 w-3" /> Detalhes técnicos
              </summary>
              <pre className="mt-3 text-[11px] text-muted-foreground/70 whitespace-pre-wrap break-all max-h-40 overflow-auto">
                {this.state.error?.message}
                {"\n\n"}
                {this.state.error?.stack?.slice(0, 600)}
              </pre>
            </details>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/login")}
                className="rounded-xl h-11 px-5 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao login
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="rounded-xl h-11 px-5 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Recarregar
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
