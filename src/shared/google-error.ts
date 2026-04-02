/**
 * Normalize Google API errors into domain errors.
 * Adapted from the Calendar plugin's google-calendar-error.ts, generalized for all services.
 */

import {
  AuthenticationRequiredError,
  ExternalServiceError,
  ResourceNotFoundError,
} from "./errors.js";

interface GoogleApiError {
  code?: number;
  message?: string;
  errors?: Array<{ domain?: string; reason?: string; message?: string }>;
}

/**
 * Extracts a structured error from a Google API response error.
 */
function extractGoogleError(error: unknown): GoogleApiError | null {
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;

    // googleapis GaxiosError shape
    if (err.response && typeof err.response === "object") {
      const response = err.response as Record<string, unknown>;
      if (response.status && typeof response.status === "number") {
        const data = response.data as Record<string, unknown> | undefined;
        const inner = data?.error as GoogleApiError | undefined;
        return {
          code: response.status,
          message: inner?.message ?? String(data ?? ""),
          errors: inner?.errors,
        };
      }
    }

    // Direct error object with code
    if (typeof err.code === "number") {
      return {
        code: err.code,
        message: typeof err.message === "string" ? err.message : undefined,
      };
    }
  }
  return null;
}

/**
 * Normalize a caught error from any Google API call into a domain error.
 *
 * @param error - The caught error
 * @param service - Service name for context (e.g., "Gmail", "Calendar")
 * @param action - What was being attempted (e.g., "search messages", "create event")
 */
export function normalizeGoogleError(
  error: unknown,
  service: string,
  action: string,
): Error {
  const apiError = extractGoogleError(error);

  if (!apiError || !apiError.code) {
    // Network error or unknown shape
    const message =
      error instanceof Error ? error.message : String(error);

    if (
      message.includes("ECONNREFUSED") ||
      message.includes("ETIMEDOUT") ||
      message.includes("ENOTFOUND") ||
      message.includes("fetch failed")
    ) {
      return new ExternalServiceError(
        service,
        `Network error while trying to ${action}: ${message}`,
      );
    }

    return new ExternalServiceError(
      service,
      `Failed to ${action}: ${message}`,
    );
  }

  switch (apiError.code) {
    case 401:
      return new AuthenticationRequiredError(
        `Authentication expired or revoked while trying to ${action}. ` +
          `Run google_workspace_begin_auth to re-authorize.`,
      );

    case 403: {
      const reasons =
        apiError.errors?.map((e) => e.reason).filter(Boolean) ?? [];
      if (
        reasons.includes("insufficientPermissions") ||
        reasons.includes("forbidden")
      ) {
        return new AuthenticationRequiredError(
          `Insufficient permissions to ${action}. ` +
            `The current OAuth token may be missing required scopes. ` +
            `Run google_workspace_begin_auth to re-authorize with updated scopes.`,
        );
      }
      if (reasons.includes("rateLimitExceeded") || reasons.includes("userRateLimitExceeded")) {
        return new ExternalServiceError(
          service,
          `Rate limit exceeded while trying to ${action}. Please wait and try again.`,
          403,
        );
      }
      return new ExternalServiceError(
        service,
        `Access denied while trying to ${action}: ${apiError.message ?? "forbidden"}`,
        403,
      );
    }

    case 404:
      return new ResourceNotFoundError(
        service,
        `The requested resource was not found while trying to ${action}.`,
      );

    case 409:
      return new ExternalServiceError(
        service,
        `Conflict while trying to ${action}: ${apiError.message ?? "resource conflict"}`,
        409,
      );

    case 429:
      return new ExternalServiceError(
        service,
        `Too many requests to ${service}. Please wait and try again.`,
        429,
      );

    default:
      if (apiError.code >= 500) {
        return new ExternalServiceError(
          service,
          `${service} server error (${apiError.code}) while trying to ${action}. ` +
            `This is a temporary issue with Google's servers. Try again shortly.`,
          apiError.code,
        );
      }
      return new ExternalServiceError(
        service,
        `${service} API error (${apiError.code}) while trying to ${action}: ${apiError.message ?? "unknown error"}`,
        apiError.code,
      );
  }
}
