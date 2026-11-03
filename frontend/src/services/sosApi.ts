/**
 * RESQNET — Citizen SOS API Client
 *
 * Calls the FastAPI backend (same as the rest of the app) for citizen SOS
 * submission and public status tracking.
 *
 * Endpoints (relative to VITE_API_BASE_URL, default: http://localhost:8001/api):
 *   POST /v1/public/incidents           — Submit a new citizen SOS
 *   GET  /v1/public/incidents/ref/:ref  — Track an existing incident by reference code
 *
 * This client intentionally does NOT fall back to in-memory mock data on
 * network failure. A failed submission is a hard error that must be surfaced
 * clearly to the citizen so they can retry or seek alternative help.
 */

// ---------------------------------------------------------------------------
// Base URL — uses the same FastAPI backend as the rest of the frontend
// ---------------------------------------------------------------------------

const getPublicApiBase = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!envUrl) {
    return 'http://localhost:8001/api/v1';
  }
  // Strip trailing /api if present, then append /v1
  const clean = envUrl.replace(/\/+$/, '');
  if (clean.endsWith('/api')) {
    return `${clean}/v1`;
  }
  if (clean.endsWith('/v1')) {
    return clean;
  }
  return `${clean}/v1`;
};

const PUBLIC_API_BASE = getPublicApiBase();

// ---------------------------------------------------------------------------
// Request / Response types
// ---------------------------------------------------------------------------

/**
 * Payload sent to POST /v1/public/incidents
 */
export interface SosSubmitPayload {
  reporter_name: string;
  reporter_contact: string;
  reporter_is_victim: boolean;
  disaster_type: string;
  people_count: number;
  trapped_count: number;
  medical_assistance_needed: boolean;
  special_needs_description?: string | null;
  description: string;
  address_text: string;
  latitude: number;
  longitude: number;
  event_id?: string | null;
}

/**
 * Minimal confirmation returned by POST /v1/public/incidents
 */
export interface SosSubmissionResponse {
  reference_code: string;
  incident_id: string;
  status: string;
  priority: string;
  created_at: string;
  tracking_url: string;
  message: string;
}

/**
 * A single sanitized status lifecycle milestone from the tracking endpoint.
 */
export interface SosStatusMilestone {
  status: string;
  timestamp: string;
  notes?: string | null;
}

/**
 * Public tracking payload returned by GET /v1/public/incidents/ref/:ref
 * Deliberately excludes reporter_name, reporter_contact, latitude, longitude,
 * ai_triage_score, and internal dispatcher IDs.
 */
export interface SosTrackingResponse {
  reference_code: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  disaster_type: string;
  people_count: number;
  trapped_count: number;
  medical_assistance_needed: boolean;
  special_needs_description?: string | null;
  description: string;
  address_text: string;
  status_history: SosStatusMilestone[];
}

// ---------------------------------------------------------------------------
// Structured error type
// ---------------------------------------------------------------------------

export class SosApiError extends Error {
  readonly statusCode: number;
  readonly serverMessage: string;

  constructor(message: string, statusCode: number, serverMessage: string) {
    super(message);
    this.name = 'SosApiError';
    this.statusCode = statusCode;
    this.serverMessage = serverMessage;
  }
}

// ---------------------------------------------------------------------------
// Internal request helper
// ---------------------------------------------------------------------------

async function request<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${PUBLIC_API_BASE}${path}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (networkErr) {
    throw new SosApiError(
      'Could not reach the emergency submission service. Please check your connection and try again.',
      0,
      String(networkErr),
    );
  }

  if (!res.ok) {
    let serverDetail = res.statusText;
    try {
      const errBody = await res.json();
      serverDetail =
        errBody?.detail ||
        errBody?.message ||
        errBody?.error?.message ||
        res.statusText;
    } catch {
      /* response body not JSON */
    }

    const userMessage =
      res.status === 400
        ? `Submission rejected: ${serverDetail}`
        : res.status === 404
          ? `Reference code not found. Please verify the code from your submission receipt.`
          : res.status === 409
            ? `A duplicate request with this reference already exists.`
            : res.status >= 500
              ? `The emergency service is temporarily unavailable (${res.status}). Please try again shortly.`
              : `Unexpected error (${res.status}): ${serverDetail}`;

    throw new SosApiError(userMessage, res.status, serverDetail);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/**
 * Submit a new citizen emergency SOS request.
 * POST /v1/public/incidents
 * @throws {SosApiError} — always propagated; no silent fallback.
 */
export async function submitSos(
  payload: SosSubmitPayload,
): Promise<SosSubmissionResponse> {
  return request<SosSubmissionResponse>('POST', '/public/incidents', payload);
}

/**
 * Retrieve the sanitized public tracking record for an existing incident.
 * GET /v1/public/incidents/ref/:referenceCode
 * @throws {SosApiError} — always propagated; no silent fallback.
 */
export async function trackByRef(
  referenceCode: string,
): Promise<SosTrackingResponse> {
  const encoded = encodeURIComponent(referenceCode.trim().toUpperCase());
  return request<SosTrackingResponse>(
    'GET',
    `/public/incidents/ref/${encoded}`,
  );
}

// ---------------------------------------------------------------------------
// Session-storage helpers
// (only the opaque reference code is stored — never PII or the submission body)
// ---------------------------------------------------------------------------

const SESSION_KEY = 'resqnet_last_sos_ref';

/** Persist the reference code after a successful submission. */
export function persistRefCode(referenceCode: string): void {
  try {
    sessionStorage.setItem(SESSION_KEY, referenceCode);
  } catch {
    /* sessionStorage unavailable in some private-browsing contexts */
  }
}

/** Retrieve the reference code from the most recent submission in this session. */
export function getPersistedRefCode(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

/** Clear the stored reference code. */
export function clearPersistedRefCode(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
