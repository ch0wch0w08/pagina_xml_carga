import axios from 'axios';
import type { Error as ApiErrorDetails } from '../types/pagination';

export class ApiError extends globalThis.Error {
  readonly details: ApiErrorDetails;

  constructor(details: ApiErrorDetails) {
    super(details.message);
    this.name = details.exception || 'ApiError';
    this.details = details;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const isObject = typeof data === 'object' && data !== null;
    const message = isObject && 'message' in data && typeof data.message === 'string'
      ? data.message
      : typeof data === 'string' && data.trim() ? data : '';

    if (message) {
      return new ApiError({
        message,
        exception: isObject && 'exception' in data && typeof data.exception === 'string'
          ? data.exception : 'ApiError',
        error: isObject && 'error' in data && typeof data.error === 'string'
          ? data.error : message,
        path: isObject && 'path' in data && typeof data.path === 'string' ? data.path : '',
      });
    }
  }

  const message = error instanceof globalThis.Error
    ? error.message
    : 'Ocurrió un error inesperado.';

  return new ApiError({ message, exception: 'ApiError', error: message, path: '' });
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return toApiError(error).message || fallback;
}
