const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost:3000')) {
    return envUrl;
  }
  return 'http://localhost:8080/api/v1';
};

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

// Single Shared Refresh Token Promise to prevent race conditions
let refreshPromise: Promise<string | null> | null = null;

async function refreshTokenShared(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.data?.accessToken) {
        const newAccessToken = data.data.accessToken;
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', newAccessToken);
        }
        return newAccessToken;
      }
    } catch (err) {
      console.error('Session refresh failed:', err);
    } finally {
      refreshPromise = null;
    }

    // Clear session & redirect on refresh failure
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return null;
  })();

  return refreshPromise;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit & { _isRetry?: boolean } = {},
): Promise<ApiResponseData<T>> {
  const baseUrl = getBaseUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => null);

  // Handle 401 Unauthorized with Shared Token Refresh Queue
  if (
    response.status === 401 &&
    !options._isRetry &&
    !endpoint.includes('/auth/refresh') &&
    !endpoint.includes('/auth/login')
  ) {
    const newAccessToken = await refreshTokenShared();
    if (newAccessToken) {
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      return apiClient<T>(endpoint, {
        ...options,
        headers,
        _isRetry: true,
      });
    }
  }

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
