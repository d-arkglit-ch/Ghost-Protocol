/**
 * ApiError — Frontend error wrapper class
 * 
 * Parses Axios error responses (or any error) into a consistent shape
 * so every component gets a clean { statusCode, message, errors, isAuthError }.
 * 
 * Usage:
 *   catch (err) {
 *     const apiError = ApiError.from(err);
 *     console.log(apiError.message);     // "password is incorrect"
 *     console.log(apiError.statusCode);  // 401
 *     console.log(apiError.isAuthError); // true
 *   }
 */

class ApiError {
  constructor({ statusCode = 500, message = "UNKNOWN_ERROR", errors = [], isAuthError = false }) {
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors; // validation errors array from backend
    this.isAuthError = isAuthError;
    this.name = "ApiError";
  }

  /**
   * Factory method — creates an ApiError from any error shape
   * Handles: Axios response errors, network errors, timeouts, plain strings, and unknowns
   */
  static from(error) {
    // Already an ApiError — return as-is
    if (error instanceof ApiError) {
      return error;
    }

    // --- Axios error with a server response ---
    if (error?.response) {
      const { status, data } = error.response;
      const message =
        data?.message ||
        data?.error ||
        data?.msg ||
        ApiError.#getDefaultMessage(status);

      return new ApiError({
        statusCode: status,
        message,
        errors: data?.errors || [],
        isAuthError: status === 401 || status === 403,
      });
    }

    // --- Axios error: request sent but no response (network down, CORS, etc.) ---
    if (error?.request) {
      // Check if it's a timeout
      if (error.code === "ECONNABORTED") {
        return new ApiError({
          statusCode: 408,
          message: "TIMEOUT: SERVER_UNRESPONSIVE",
        });
      }

      return new ApiError({
        statusCode: 0,
        message: "NETWORK_ERROR: CONNECTION_LOST",
      });
    }

    // --- Plain string error ---
    if (typeof error === "string") {
      return new ApiError({ message: error });
    }

    // --- Standard JS Error or anything with .message ---
    if (error?.message) {
      return new ApiError({ message: error.message });
    }

    // --- Completely unknown ---
    return new ApiError({ message: "SYSTEM_ERROR: UNKNOWN_FAULT" });
  }

  /**
   * Returns a default user-facing message for common HTTP status codes
   */
  static #getDefaultMessage(statusCode) {
    const messages = {
      400: "BAD_REQUEST: INVALID_INPUT",
      401: "UNAUTHORIZED: ACCESS_DENIED",
      403: "FORBIDDEN: INSUFFICIENT_PERMISSIONS",
      404: "NOT_FOUND: RESOURCE_MISSING",
      409: "CONFLICT: DUPLICATE_ENTRY",
      422: "VALIDATION_ERROR: CHECK_INPUT",
      429: "RATE_LIMITED: TOO_MANY_REQUESTS",
      500: "SERVER_ERROR: INTERNAL_FAULT",
      502: "BAD_GATEWAY: UPSTREAM_FAILURE",
      503: "SERVICE_UNAVAILABLE: SERVER_DOWN",
    };
    return messages[statusCode] || `ERROR: STATUS_${statusCode}`;
  }

  /**
   * String representation for logging
   */
  toString() {
    return `[ApiError ${this.statusCode}] ${this.message}`;
  }
}

export default ApiError;
