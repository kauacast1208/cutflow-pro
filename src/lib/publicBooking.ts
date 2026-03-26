import { supabase } from "@/integrations/supabase/client";

type UnknownRecord = Record<string, unknown>;

export interface PublicBarbershop extends UnknownRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  address_complement: string | null;
  instagram: string | null;
  whatsapp: string | null;
  logo_url: string | null;
  opening_time: string;
  closing_time: string;
  slot_interval_minutes: number;
  buffer_minutes: number;
  min_advance_hours: number;
  allow_online_cancellation: boolean;
  allow_online_reschedule: boolean;
  cancellation_limit_hours: number | null;
  auto_confirm: boolean;
  closed_days: number[];
}

export interface PublicService extends UnknownRecord {
  id: string;
  barbershop_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  category: string | null;
  active: boolean;
  sort_order: number | null;
}

export interface PublicProfessional extends UnknownRecord {
  id: string;
  barbershop_id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
  specialties: string[];
  work_days: number[];
  work_start: string | null;
  work_end: string | null;
  break_start_time: string | null;
  break_end_time: string | null;
}

export interface PublicAvailability extends UnknownRecord {
  id?: string;
  professional_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface PublicBookingPageData {
  barbershop: PublicBarbershop | null;
  services: PublicService[];
  professionals: PublicProfessional[];
  availability: PublicAvailability[];
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

function parseJsonString(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function unwrapJsonValue<T = unknown>(value: unknown): T | unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return value;
  }

  if (
    trimmed === "null" ||
    trimmed.startsWith("{") ||
    trimmed.startsWith("[") ||
    trimmed === "true" ||
    trimmed === "false" ||
    /^-?\d+(\.\d+)?$/.test(trimmed)
  ) {
    return parseJsonString(trimmed);
  }

  return value;
}

function asRecord(value: unknown): UnknownRecord | null {
  const unwrapped = unwrapJsonValue(value);
  return isRecord(unwrapped) ? unwrapped : null;
}

function asRecordArray(value: unknown): UnknownRecord[] {
  const unwrapped = unwrapJsonValue(value);
  return Array.isArray(unwrapped) ? unwrapped.map(asRecord).filter(Boolean) as UnknownRecord[] : [];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  return value == null ? null : String(value);
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }

  return fallback;
}

function asNumberArray(value: unknown): number[] {
  const unwrapped = unwrapJsonValue(value);
  if (!Array.isArray(unwrapped)) {
    return [];
  }

  return unwrapped
    .map((item) => asNumber(item, Number.NaN))
    .filter((item) => Number.isFinite(item));
}

function asStringArray(value: unknown): string[] {
  const unwrapped = unwrapJsonValue(value);
  if (!Array.isArray(unwrapped)) {
    return [];
  }

  return unwrapped
    .map((item) => (typeof item === "string" ? item : null))
    .filter((item): item is string => Boolean(item));
}

function normalizeBarbershop(value: unknown): PublicBarbershop | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const id = asString(record.id);
  const name = asString(record.name);
  const slug = asString(record.slug);

  if (!id || !name || !slug) {
    return null;
  }

  return {
    ...record,
    id,
    name,
    slug,
    description: asNullableString(record.description),
    phone: asNullableString(record.phone),
    address: asNullableString(record.address),
    address_complement: asNullableString(record.address_complement),
    instagram: asNullableString(record.instagram),
    whatsapp: asNullableString(record.whatsapp),
    logo_url: asNullableString(record.logo_url),
    opening_time: asString(record.opening_time, "09:00"),
    closing_time: asString(record.closing_time, "19:00"),
    slot_interval_minutes: asNumber(record.slot_interval_minutes, 30),
    buffer_minutes: asNumber(record.buffer_minutes, 0),
    min_advance_hours: asNumber(record.min_advance_hours, 1),
    allow_online_cancellation: asBoolean(record.allow_online_cancellation, false),
    allow_online_reschedule: asBoolean(record.allow_online_reschedule, false),
    cancellation_limit_hours: record.cancellation_limit_hours == null ? null : asNumber(record.cancellation_limit_hours, 0),
    auto_confirm: asBoolean(record.auto_confirm, false),
    closed_days: asNumberArray(record.closed_days),
  };
}

function normalizeService(value: unknown): PublicService | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const id = asString(record.id);
  const barbershopId = asString(record.barbershop_id);
  const name = asString(record.name);

  if (!id || !barbershopId || !name) {
    return null;
  }

  return {
    ...record,
    id,
    barbershop_id: barbershopId,
    name,
    description: asNullableString(record.description),
    duration_minutes: asNumber(record.duration_minutes, 0),
    price: asNumber(record.price, 0),
    category: asNullableString(record.category),
    active: asBoolean(record.active, true),
    sort_order: record.sort_order == null ? null : asNumber(record.sort_order, 0),
  };
}

function normalizeProfessional(value: unknown): PublicProfessional | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const id = asString(record.id);
  const barbershopId = asString(record.barbershop_id);
  const name = asString(record.name);

  if (!id || !barbershopId || !name) {
    return null;
  }

  return {
    ...record,
    id,
    barbershop_id: barbershopId,
    name,
    role: asNullableString(record.role),
    avatar_url: asNullableString(record.avatar_url),
    specialties: asStringArray(record.specialties),
    work_days: asNumberArray(record.work_days),
    work_start: asNullableString(record.work_start),
    work_end: asNullableString(record.work_end),
    break_start_time: asNullableString(record.break_start_time),
    break_end_time: asNullableString(record.break_end_time),
  };
}

function normalizeAvailability(value: unknown): PublicAvailability | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const professionalId = asString(record.professional_id);
  const startTime = asString(record.start_time);
  const endTime = asString(record.end_time);

  if (!professionalId || !startTime || !endTime) {
    return null;
  }

  return {
    ...record,
    id: asString(record.id) || undefined,
    professional_id: professionalId,
    weekday: asNumber(record.weekday, -1),
    start_time: startTime,
    end_time: endTime,
  };
}

function normalizePayload(payload: PublicBookingRpcPayload): PublicBookingPageData | null {
  const barbershop = normalizeBarbershop(payload.barbershop);

  if (!barbershop) {
    return null;
  }

  return {
    barbershop,
    services: asRecordArray(payload.services).map(normalizeService).filter(Boolean) as PublicService[],
    professionals: asRecordArray(payload.professionals).map(normalizeProfessional).filter(Boolean) as PublicProfessional[],
    availability: asRecordArray(payload.availability).map(normalizeAvailability).filter(Boolean) as PublicAvailability[],
  };
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

  if (Array.isArray(raw)) {
    if (raw.length === 0) {
      return null;
    }

    return parsePublicBookingPayload(raw[0]);
  }

  return isRecord(raw) ? (raw as PublicBookingRpcPayload) : null;
}

export function buildPublicBookingPath(slug: string) {
  return `/b/${encodeURIComponent(normalizePublicBookingSlug(slug))}`;
}

export function buildPublicBookingUrl(slug: string, origin = window.location.origin) {
  return `${origin}${buildPublicBookingPath(slug)}`;
}

async function fetchPublicBookingPageDataFallback(slug: string): Promise<PublicBookingPageData | null> {
  const { data: barbershopRow, error: barbershopError } = await supabase
    .from("barbershops")
    .select(`
      id,
      name,
      slug,
      description,
      phone,
      address,
      address_complement,
      instagram,
      whatsapp,
      logo_url,
      opening_time,
      closing_time,
      slot_interval_minutes,
      buffer_minutes,
      min_advance_hours,
      allow_online_cancellation,
      allow_online_reschedule,
      cancellation_limit_hours,
      auto_confirm,
      closed_days
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (barbershopError) {
    throw barbershopError;
  }

  const barbershop = normalizeBarbershop(barbershopRow);

  if (!barbershop) {
    return null;
  }

  const [{ data: serviceRows, error: servicesError }, { data: professionalRows, error: professionalsError }] = await Promise.all([
    supabase
      .from("services")
      .select(`
        id,
        barbershop_id,
        name,
        description,
        duration_minutes,
        price,
        category,
        active,
        sort_order
      `)
      .eq("barbershop_id", barbershop.id)
      .eq("active", true)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true }),
    supabase
      .from("professionals")
      .select(`
        id,
        barbershop_id,
        name,
        role,
        avatar_url,
        specialties,
        work_days,
        work_start,
        work_end,
        break_start_time,
        break_end_time,
        active
      `)
      .eq("barbershop_id", barbershop.id)
      .eq("active", true)
      .order("name", { ascending: true }),
  ]);

  if (servicesError) {
    throw servicesError;
  }

  if (professionalsError) {
    throw professionalsError;
  }

  const professionals = (professionalRows ?? [])
    .map(normalizeProfessional)
    .filter(Boolean) as PublicProfessional[];

  const professionalIds = professionals.map((professional) => professional.id);

  let availabilityRows: unknown[] = [];

  if (professionalIds.length > 0) {
    const { data, error } = await supabase
      .from("professional_availability")
      .select("id, professional_id, weekday, start_time, end_time")
      .in("professional_id", professionalIds)
      .order("weekday", { ascending: true })
      .order("start_time", { ascending: true })
      .order("end_time", { ascending: true });

    if (error) {
      throw error;
    }

    availabilityRows = data ?? [];
  }

  return {
    barbershop,
    services: (serviceRows ?? []).map(normalizeService).filter(Boolean) as PublicService[],
    professionals,
    availability: availabilityRows.map(normalizeAvailability).filter(Boolean) as PublicAvailability[],
  };
}

export async function fetchPublicBookingPageData(slug: string): Promise<PublicBookingPageData | null> {
  const normalizedSlug = normalizePublicBookingSlug(slug);

  if (!normalizedSlug) {
    return null;
  }

  try {
    const { data, error } = await (supabase as any).rpc("get_public_booking_page_data", {
      _slug: normalizedSlug,
    });

    if (error) {
      console.error("[public-booking] RPC load failed", {
        slug: normalizedSlug,
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return await fetchPublicBookingPageDataFallback(normalizedSlug);
    }

    const payload = parsePublicBookingPayload(data);

    if (!payload) {
      console.warn("[public-booking] RPC returned empty or unparseable payload", {
        slug: normalizedSlug,
        data,
      });
      return await fetchPublicBookingPageDataFallback(normalizedSlug);
    }

    const normalized = normalizePayload(payload);

    if (!normalized) {
      console.warn("[public-booking] RPC payload missing required barbershop fields", {
        slug: normalizedSlug,
        payload,
      });
      return await fetchPublicBookingPageDataFallback(normalizedSlug);
    }

    return normalized;
  } catch (error) {
    console.error("[public-booking] Fallback load failed", { slug: normalizedSlug, error });
    throw error;
  }
}
