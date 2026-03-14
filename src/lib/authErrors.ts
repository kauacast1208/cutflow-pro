const normalize = (message?: string | null) => (message || "").toLowerCase();

export function isInvalidApiKeyMessage(message?: string | null): boolean {
  const msg = normalize(message);
  return (
    msg.includes("invalid api key") ||
    msg.includes("invalid apikey") ||
    msg.includes("apikey")
  );
}

export function mapLoginError(rawMessage?: string | null): string {
  const msg = normalize(rawMessage);

  if (isInvalidApiKeyMessage(rawMessage)) {
    return "Erro de configuração da autenticação. Recarregue a página e tente novamente.";
  }
  if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
    return "E-mail ou senha incorretos. Verifique e tente novamente.";
  }
  if (msg.includes("email not confirmed")) {
    return "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
  }
  if (msg.includes("too many requests") || msg.includes("rate")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  return rawMessage || "Não foi possível fazer login. Tente novamente.";
}

export function mapSignupError(rawMessage?: string | null): string {
  const msg = normalize(rawMessage);

  if (isInvalidApiKeyMessage(rawMessage)) {
    return "Erro de configuração da autenticação. Recarregue a página e tente novamente.";
  }
  if (msg.includes("already registered") || msg.includes("already been registered")) {
    return "Este e-mail já está cadastrado. Faça login ou recupere sua senha.";
  }
  if (msg.includes("password") && msg.includes("leaked")) {
    return "Esta senha foi encontrada em vazamentos de dados. Escolha uma senha mais segura.";
  }
  if (msg.includes("valid email")) {
    return "Informe um endereço de e-mail válido.";
  }
  if (msg.includes("password") && (msg.includes("short") || msg.includes("length"))) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  return rawMessage || "Não foi possível criar sua conta. Tente novamente.";
}

export function mapOAuthError(rawMessage?: string | null, mode: "login" | "signup" = "login"): string {
  if (isInvalidApiKeyMessage(rawMessage)) {
    return "Erro de configuração da autenticação. Recarregue a página e tente novamente.";
  }

  if (mode === "signup") {
    return "Não foi possível continuar com Google. Tente usar e-mail e senha.";
  }

  return "Não foi possível entrar com Google. Tente usar e-mail e senha.";
}
