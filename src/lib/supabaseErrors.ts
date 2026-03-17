export function isNoRowsError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; details?: string; message?: string };
  return e.code === "PGRST116" || e.details === "The result contains 0 rows" || false;
}

export function isMissingRelationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  return e.code === "PGRST200" || (e.message?.includes("relation") && e.message?.includes("does not exist")) || false;
}

export function formatSupabaseError(error: unknown): string {
  if (!error) return "Erro desconhecido.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  const e = error as { message?: string; error_description?: string };
  return e.message || e.error_description || "Erro desconhecido.";
}
