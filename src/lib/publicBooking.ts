import { supabase } from "@/integrations/supabase/client";

type UnknownRecord = Record<string, unknown>;

export interface PublicBookingPageData {
  barbershop: UnknownRecord | null;
  services: UnknownRecord[];
  professionals: UnknownRecord[];
  availability: UnknownRecord[];
}

interface PublicBookingRpcPayload extends UnknownRecord {
  barbershop?: unknown;
  services?: unknown;
  professionals?: unknown;
  availability?: unknown;
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizePublicBookingSlug(slug: string) {
  return safeDecodeURIComponent(slug).trim();
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecordArray(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function parsePublicBookingPayload(raw: unknown): PublicBookingRpcPayload | null {
  if (raw == null) {
    return null;
  }

  if (typeof raw === "string") {
    try {
      return parsePublicBookingPayload(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  return isRecord(raw) ? (raw as PublicBookingRpcPayload) : null;
}

export function buildPublicBookingPath(slug: string) {
  return `/b/${encodeURIComponent(normalizePublicBookingSlug(slug))}`;
}

export function buildPublicBookingUrl(slug: string, origin = window.location.origin) {
  return `${origin}${buildPublicBookingPath(slug)}`;
}

export async function fetchPublicBookingPageData(slug: string): Promise<PublicBookingPageData | null> {
  const normalizedSlug = normalizePublicBookingSlug(slug);

  if (!normalizedSlug) {
    return null;
  }

  const { data, error } = await supabase.rpc("get_public_booking_page_data", {
    _slug: normalizedSlug,
  });

  if (error) {
    throw error;
  }

  const payload = parsePublicBookingPayload(data);

  if (!payload) {
    return null;
  }

  return {
    barbershop: isRecord(payload.barbershop) ? payload.barbershop : null,
    services: asRecordArray(payload.services),
    professionals: asRecordArray(payload.professionals),
    availability: asRecordArray(payload.availability),
  };
}
