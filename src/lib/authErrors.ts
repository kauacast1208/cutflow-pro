const normalize = (message?: string | null) => (message || "").trim().toLowerCase();

function hasAny(msg: string, terms: string[]) {
  return terms.some((term) => msg.includes(term));
}

function getConfigErrorMessage(rawMessage?: string | null): string | null {
  const msg = normalize(rawMessage);

  if (!msg) return null;

  if (hasAny(msg, ["missing oauth secret", "unsupported provider", "provider is not enabled"])) {
    return "Login com Google indisponível no momento.";
  }

  if (hasAny(msg, ["supabaseurl is required", "supabase url is required"])) {
    return "URL da autenticação não configurada.";
  }

  if (hasAny(msg, ["supabasekey is required", "supabase key is required", "apikey is required", "invalid api key"])) {
    return "Chave da autenticação inválida ou ausente.";
  }

  if (hasAny(msg, ["auth client init failure", "failed to initialize auth client", "failed to initialize the client", "client initialization failed"])) {
    return "Falha ao inicializar o cliente de autenticação.";
  }

  return null;
}

/**
 * Detecta SOMENTE erros explícitos de configuração retornados pela autenticação.
 */
export function isAuthConfigurationError(message?: string | null): boolean {
  return Boolean(getConfigErrorMessage(message));
}

// Backward-compatible alias used by existing screens.
export function isInvalidApiKeyMessage(message?: string | null): boolean {
  return isAuthConfigurationError(message);
}

export function mapSessionRestoreError(rawMessage?: string | null): string {
  const configError = getConfigErrorMessage(rawMessage);
  if (configError) return configError;

  const msg = normalize(rawMessage);

  if (hasAny(msg, ["flow state", "flow_state", "bad_oauth_state", "oauth state", "callback"])) {
    return "Callback inválido. Tente entrar novamente.";
  }

  if (hasAny(msg, ["exchange", "code verifier", "code challenge", "authorization code", "invalid grant"])) {
    return "Erro ao trocar code por sessão.";
  }

  if (hasAny(msg, ["session not found", "session missing", "auth session missing", "not authenticated"])) {
    return "Sessão não encontrada. Faça login novamente.";
  }

  if (hasAny(msg, ["refresh token", "invalid refresh token", "token revoked", "token_revoked", "jwt expired", "token has expired"])) {
    return "Falha ao restaurar sessão. Faça login novamente.";
  }

  if (hasAny(msg, ["network", "failed to fetch", "fetch"])) {
    return "Falha de conexão ao restaurar a sessão.";
  }

  if (rawMessage?.trim()) {
    return `Falha ao restaurar sessão: ${rawMessage.trim()}`;
  }

  return "Falha ao restaurar sessão.";
}

export function mapLoginError(rawMessage?: string | null): string {
  const configError = getConfigErrorMessage(rawMessage);
  if (configError) return configError;

  const msg = normalize(rawMessage);

  if (hasAny(msg, ["invalid login credentials", "invalid_credentials"])) {
    return "Credenciais inválidas. Verifique e tente novamente.";
  }
  if (msg.includes("email not confirmed")) {
    return "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
  }
  if (hasAny(msg, ["session not found", "session missing", "auth session missing", "not authenticated"])) {
    return "Sessão não encontrada. Faça login novamente.";
  }
  if (hasAny(msg, ["refresh token", "invalid refresh token", "token revoked", "token_revoked", "jwt expired", "token has expired"])) {
    return "Falha ao restaurar sessão. Faça login novamente.";
  }
  if (hasAny(msg, ["too many requests", "rate limit", "rate_limit"])) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  if (hasAny(msg, ["network", "failed to fetch", "fetch"])) {
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  }

  if (rawMessage?.trim()) {
    return `Falha no login: ${rawMessage.trim()}`;
  }

  return "Não foi possível fazer login agora.";
}

export function mapSignupError(rawMessage?: string | null): string {
  const configError = getConfigErrorMessage(rawMessage);
  if (configError) return configError;

  const msg = normalize(rawMessage);

  if (hasAny(msg, ["already registered", "already been registered", "user already registered"])) {
    return "Este e-mail já está cadastrado. Faça login ou recupere sua senha.";
  }
  if (msg.includes("password") && msg.includes("leaked")) {
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
  if (hasAny(msg, ["too many requests", "rate limit", "rate_limit"])) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  if (hasAny(msg, ["network", "failed to fetch", "fetch"])) {
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  }

  if (rawMessage?.trim()) {
    return `Falha no cadastro: ${rawMessage.trim()}`;
  }

  return "Não foi possível criar sua conta agora.";
}

export function mapOAuthError(rawMessage?: string | null, mode: "login" | "signup" = "login"): string {
  const configError = getConfigErrorMessage(rawMessage);
  if (configError) return configError;

  const msg = normalize(rawMessage);

  if (hasAny(msg, ["access_denied", "cancelled", "canceled", "user denied"])) {
    return "Login com Google cancelado. Tente novamente se desejar continuar.";
  }

  if (
    hasAny(msg, [
      "flow state",
      "flow_state",
      "bad_oauth_state",
      "oauth state",
      "callback",
      "exchange",
      "code verifier",
      "code challenge",
      "authorization code",
      "invalid grant",
      "session not found",
      "session missing",
      "auth session missing",
      "not authenticated",
      "refresh token",
      "invalid refresh token",
      "token revoked",
      "token_revoked",
      "jwt expired",
      "token has expired",
    ])
  ) {
    return mapSessionRestoreError(rawMessage);
  }

  if (rawMessage?.trim()) {
    return mode === "signup"
      ? `Falha ao continuar com Google: ${rawMessage.trim()}`
      : `Falha ao entrar com Google: ${rawMessage.trim()}`;
  }

  return mode === "signup"
    ? "Não foi possível continuar com Google."
    : "Não foi possível entrar com Google.";
}

export function mapPasswordRecoveryRequestError(rawMessage?: string | null): string {
  const configError = getConfigErrorMessage(rawMessage);
  if (configError) return configError;

  const msg = normalize(rawMessage);

  if (hasAny(msg, ["too many requests", "rate limit", "rate_limit"])) {
    return "Você solicitou muitos links em pouco tempo. Aguarde alguns minutos.";
  }
  if (hasAny(msg, ["network", "failed to fetch", "fetch"])) {
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  }

  if (rawMessage?.trim()) {
    return `Falha ao enviar o link: ${rawMessage.trim()}`;
  }

  return "Não foi possível enviar o link agora.";
}

export function mapResetPasswordError(rawMessage?: string | null): string {
  const configError = getConfigErrorMessage(rawMessage);
  if (configError) return configError;

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
  if (hasAny(msg, ["flow state", "flow_state", "exchange", "callback", "invalid grant"])) {
    return mapSessionRestoreError(rawMessage);
  }
  if (hasAny(msg, ["network", "failed to fetch", "fetch"])) {
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  }

  if (rawMessage?.trim()) {
    return `Falha ao redefinir a senha: ${rawMessage.trim()}`;
  }

  return "Não foi possível redefinir a senha. Solicite um novo link.";
}
