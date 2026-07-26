import type { ApiErrorResponse, ApiSuccessResponse, PaginationMeta } from '../types';

export const successResponse = <T>(
  data: T,
  message?: string,
  meta?: PaginationMeta,
): ApiSuccessResponse<T> => ({
  success: true,
  message,
  data,
  meta,
});

export const errorResponse = (
  code: string,
  message: string,
  details?: unknown,
): ApiErrorResponse => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
});
