const normalize = (message?: string | null) => (message || "").toLowerCase();

function hasAny(msg: string, terms: string[]) {
  return terms.some((term) => msg.includes(term));
}

/**
 * Detects auth configuration errors ONLY from the actual error message content.
 * Never assumes config is broken based on env var sniffing — Vite static replacement
 * can make runtime checks unreliable in production builds.
 */
export function isAuthConfigurationError(message?: string | null): boolean {
  const msg = normalize(message);

  if (!msg) return false;

  return hasAny(msg, [
    "supabaseurl is required",
    "supabasekey is required",
    "supabase url is required",
    "supabase key is required",
    "invalid api key",
    "apikey is required",
  ]);
}

// Backward-compatible alias used by existing screens.
export function isInvalidApiKeyMessage(message?: string | null): boolean {
  return isAuthConfigurationError(message);
}

export function mapLoginError(rawMessage?: string | null): string {
  const msg = normalize(rawMessage);

  if (isAuthConfigurationError(rawMessage)) {
    return "Erro de configuração da autenticação. Recarregue a página e tente novamente.";
  }
  if (hasAny(msg, ["invalid login credentials", "invalid_credentials"])) {
    return "E-mail ou senha incorretos. Verifique e tente novamente.";
  }
  if (msg.includes("email not confirmed")) {
    return "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
  }
  if (hasAny(msg, ["too many requests", "rate limit", "rate_limit"])) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  if (hasAny(msg, ["network", "failed to fetch", "fetch"])) {
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  }

  return "Não foi possível fazer login agora. Tente novamente em instantes.";
}

export function mapSignupError(rawMessage?: string | null): string {
  const msg = normalize(rawMessage);

  if (isAuthConfigurationError(rawMessage)) {
    return "Erro de configuração da autenticação. Recarregue a página e tente novamente.";
  }
  if (hasAny(msg, ["already registered", "already been registered", "user already registered"])) {
    return "Este e-mail já está cadastrado. Faça login ou recupere sua senha.";
  }
  if (hasAny(msg, ["password", "leaked"]) && msg.includes("password") && msg.includes("leaked")) {
    return "Esta senha foi encontrada em vazamentos de dados. Escolha uma senha mais segura.";
  }
  if (msg.includes("valid email")) {
    return "Informe um endereço de e-mail válido.";
  }
  if (msg.includes("signup is disabled")) {
    return "Cadastro por e-mail está desativado no momento.";
  }
  if (msg.includes("database error saving new user")) {
    return "Não foi possível concluir seu cadastro agora. Tente novamente em alguns instantes.";
  }
  if (msg.includes("password") && hasAny(msg, ["short", "length", "at least"])) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }

  return "Não foi possível criar sua conta agora. Tente novamente.";
}

export function mapOAuthError(rawMessage?: string | null, mode: "login" | "signup" = "login"): string {
  const msg = normalize(rawMessage);

  if (isAuthConfigurationError(rawMessage)) {
    return "Erro de configuração da autenticação. Recarregue a página e tente novamente.";
  }

  if (hasAny(msg, ["missing oauth secret", "unsupported provider", "provider is not enabled"])) {
    return "Login com Google indisponível no momento. Use e-mail e senha enquanto ajustamos a configuração.";
  }

  if (hasAny(msg, ["access_denied", "cancelled", "canceled", "user denied"])) {
    return "Login com Google cancelado. Tente novamente se desejar continuar.";
  }

  if (mode === "signup") {
    return "Não foi possível continuar com Google. Tente usar e-mail e senha.";
  }

  return "Não foi possível entrar com Google. Tente usar e-mail e senha.";
}

export function mapPasswordRecoveryRequestError(rawMessage?: string | null): string {
  const msg = normalize(rawMessage);

  if (isAuthConfigurationError(rawMessage)) {
    return "Erro de configuração da autenticação. Recarregue a página e tente novamente.";
  }
  if (hasAny(msg, ["too many requests", "rate limit", "rate_limit"])) {
    return "Você solicitou muitos links em pouco tempo. Aguarde alguns minutos.";
  }

  return "Não foi possível enviar o link agora. Tente novamente.";
}

export function mapResetPasswordError(rawMessage?: string | null): string {
  const msg = normalize(rawMessage);

  if (hasAny(msg, ["same_password", "different"])) {
    return "A nova senha não pode ser igual à senha anterior.";
  }
  if (hasAny(msg, ["session", "not authenticated", "auth session missing"])) {
    return "Sessão expirada. Solicite um novo link de recuperação.";
  }
  if (msg.includes("weak password")) {
    return "Sua nova senha está fraca. Use uma senha mais forte.";
  }

  return "Não foi possível redefinir a senha. Solicite um novo link.";
}
