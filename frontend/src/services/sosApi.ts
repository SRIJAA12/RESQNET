/**
 * RESQNET — Phase 2: Serverless Citizen SOS API Client
 *
 * Dedicated API client for the citizen-facing public endpoints served by the
 * AWS SAM / API Gateway HTTP API (Phase 1 serverless pipeline).
 *
 * This client intentionally does NOT fall back to in-memory mock data on
 * network failure. A failed submission is a hard error that must be surfaced
 * clearly to the citizen so they can retry or seek alternative help.
 *
 * Endpoints (relative to VITE_SERVERLESS_API_URL, default: http://localhost:3000):
 *   POST /v1/public/incidents           — Submit a new citizen SOS
 *   GET  /v1/public/incidents/ref/:ref  — Track an existing incident by reference code
 */

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

/**
 * Base URL of the SAM local API Gateway or deployed API Gateway stage URL.
 * In local development: http://localhost:3000  (default sam local start-api port)
 * In production:        the CloudFormation output URL for the HTTP API stage.
 */
const SERVERLESS_BASE =
  (import.meta.env.VITE_SERVERLESS_API_URL as string | undefined) ||
  'http://localhost:3000';

// ---------------------------------------------------------------------------
// Request / Response types — mirrors backend_serverless/schemas/incident.py
// ---------------------------------------------------------------------------

/**
 * Payload sent to POST /v1/public/incidents
 * Aligns exactly with PublicIncidentCreate Pydantic schema.
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
 * Mirrors PublicIncidentCreationResponse Pydantic schema.
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
 * Mirrors SanitizedIncidentMilestone Pydantic schema.
 */
export interface SosStatusMilestone {
  status: string;
  timestamp: string;
  notes?: string | null;
}

/**
 * Public tracking payload returned by GET /v1/public/incidents/ref/:ref
 * Mirrors SanitizedIncidentTrackingResponse Pydantic schema.
 *
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
  const url = `${SERVERLESS_BASE}${path}`;
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
 * Submit a new citizen emergency SOS request to the serverless pipeline.
 *
 * POST /v1/public/incidents
 *
 * @throws {SosApiError} — always propagated; no silent fallback.
 */
export async function submitSos(
  payload: SosSubmitPayload,
): Promise<SosSubmissionResponse> {
  return request<SosSubmissionResponse>('POST', '/v1/public/incidents', payload);
}

/**
 * Retrieve the sanitized public tracking record for an existing incident.
 *
 * GET /v1/public/incidents/ref/:referenceCode
 *
 * @throws {SosApiError} — always propagated; no silent fallback.
 */
export async function trackByRef(
  referenceCode: string,
): Promise<SosTrackingResponse> {
  const encoded = encodeURIComponent(referenceCode.trim().toUpperCase());
  return request<SosTrackingResponse>(
    'GET',
    `/v1/public/incidents/ref/${encoded}`,
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
