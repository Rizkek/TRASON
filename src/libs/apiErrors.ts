/**
 * Centralized API Error Handling
 * Converts Supabase errors to user-friendly messages
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public originalError?: any,
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }

  isAuthError(): boolean {
    return this.statusCode === 401 || this.code === 'AUTH_ERROR';
  }

  isDuplicate(): boolean {
    return this.code === 'DUPLICATE' || this.statusCode === 409;
  }

  isNotFound(): boolean {
    return this.code === 'NOT_FOUND' || this.statusCode === 404;
  }

  isForeignKeyError(): boolean {
    return this.code === 'FOREIGN_KEY';
  }
}

/**
 * PostgreSQL error code mapping
 * https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const POSTGRES_ERROR_MAP: Record<string, [number, string, string]> = {
  '23505': [409, 'DUPLICATE', 'This record already exists'],
  '23503': [400, 'FOREIGN_KEY', 'Cannot delete - this record is referenced elsewhere'],
  '23502': [400, 'NOT_NULL', 'Missing required field'],
  '23514': [400, 'CHECK_VIOLATION', 'Invalid data value'],
  '42P01': [400, 'UNDEFINED_TABLE', 'Database table not found'],
  '42703': [400, 'UNDEFINED_COLUMN', 'Database column not found'],
  '22012': [400, 'DIVISION_BY_ZERO', 'Calculation error (division by zero)'],
  '22P02': [400, 'INVALID_TYPE', 'Invalid data type'],
};

/**
 * Convert any error to ApiError
 * Handles Supabase errors, network errors, auth errors, etc.
 */
export function handleQueryError(error: any): ApiError {
  // Already an ApiError
  if (error instanceof ApiError) {
    return error;
  }

  // Supabase PostgreSQL error
  if (error?.code && POSTGRES_ERROR_MAP[error.code]) {
    const [status, code, message] = POSTGRES_ERROR_MAP[error.code];
    return new ApiError(status, code, message, error);
  }

  // Supabase Auth error
  if (error?.name === 'AuthApiError') {
    if (error.status === 401) {
      return new ApiError(401, 'AUTH_ERROR', 'Your session has expired. Please log in again.', error);
    }
    if (error.message?.includes('Invalid login credentials')) {
      return new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password', error);
    }
    if (error.message?.includes('already registered')) {
      return new ApiError(409, 'DUPLICATE', 'An account with this email already exists', error);
    }
  }

  // Supabase RLS policy error
  if (error?.message?.includes('new row violates row-level security')) {
    return new ApiError(403, 'RLS_VIOLATION', 'You do not have permission to perform this action', error);
  }

  // Network error
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return new ApiError(0, 'NETWORK_ERROR', 'Network connection failed. Check your internet and try again.', error);
  }

  // Fetch error (offline)
  if (!navigator?.onLine) {
    return new ApiError(0, 'OFFLINE', 'You are offline. Some features may be unavailable.', error);
  }

  // Timeout error
  if (error?.name === 'AbortError' || error?.message === 'Request timeout') {
    return new ApiError(408, 'TIMEOUT', 'Request took too long. Please try again.', error);
  }

  // Generic error with message
  if (error?.message) {
    return new ApiError(500, 'UNKNOWN', error.message, error);
  }

  // Catch-all
  return new ApiError(500, 'UNKNOWN', 'An unexpected error occurred', error);
}

/**
 * Safe error message for displaying to users
 * Never exposes database/technical details
 */
export function getUserErrorMessage(error: any): string {
  try {
    const apiError = error instanceof ApiError ? error : handleQueryError(error);

    // Map error codes to user-friendly messages
    const messages: Record<string, string> = {
      'DUPLICATE': 'This record already exists.',
      'FOREIGN_KEY': 'Cannot remove this item - it\'s referenced elsewhere.',
      'NOT_NULL': 'Please fill in all required fields.',
      'CHECK_VIOLATION': 'The data you entered is invalid.',
      'UNDEFINED_TABLE': 'Database error. Please contact support.',
      'UNDEFINED_COLUMN': 'Database error. Please contact support.',
      'DIVISION_BY_ZERO': 'Calculation error occurred.',
      'INVALID_TYPE': 'Invalid data type.',
      'AUTH_ERROR': 'Authentication failed. Please try logging in again.',
      'INVALID_CREDENTIALS': 'Email or password is incorrect.',
      'RLS_VIOLATION': 'You don\'t have permission to do this.',
      'NETWORK_ERROR': 'Network connection failed. Check your internet and try again.',
      'OFFLINE': 'You\'re offline. Some features are unavailable.',
      'TIMEOUT': 'Request took too long. Please try again.',
    };

    return messages[apiError.code] || apiError.message || 'Something went wrong. Please try again.';
  } catch (e) {
    return 'An unexpected error occurred.';
  }
}

/**
 * Log error for debugging (only in development)
 */
export function logError(error: any, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    const apiError = error instanceof ApiError ? error : handleQueryError(error);
    console.error(
      `[${context || 'Error'}] ${apiError.code} (${apiError.statusCode}):`,
      apiError.message,
      apiError.originalError,
    );
  }
}
