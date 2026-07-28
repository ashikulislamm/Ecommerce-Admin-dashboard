const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface ApiResponseData<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    details: Array<{ field?: string; message: string }>;
  };
}

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: Array<{ field?: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: Array<{ field?: string; message: string }>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponseData<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || response.statusText || 'An unexpected error occurred';
    throw new ApiError(
      errorMessage,
      response.status,
      data?.error?.code,
      data?.error?.details,
    );
  }

  return data as ApiResponseData<T>;
}
