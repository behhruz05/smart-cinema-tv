import { triggerLogout } from "../../features/auth/authBridge";
import { tokenStorage } from "../lib/tokenStorage";
import i18n from '../../i18n';

export const BASE_URL = 'https://api.alloplay.uz/api/v1';
const TIMEOUT = 10000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  retry?: number;
  signal?: AbortSignal;
  skipAuth?: boolean;
}

type ApiError = Error & {
  status?: number;
  payload?: unknown;
};

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message?.toLowerCase?.() ?? '';
  return (
    error.name === 'TypeError' &&
    (message.includes('network request failed') || message.includes('failed to fetch'))
  );
}

function safeParseResponse(text: string): any {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number,
  signal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  return fetch(url, {
    ...options,
    signal: signal || controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });
}

export async function api<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    retry = 0,
    signal,
    skipAuth = false,
  } = options;

  try {
    const token = skipAuth ? null : await tokenStorage.get();
    const hasBody = body !== undefined && body !== null;

    const response = await fetchWithTimeout(
      `${BASE_URL}${endpoint}`,
      {
        method,
        headers: {
          ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        body: hasBody ? JSON.stringify(body) : undefined,
      },
      TIMEOUT,
      signal
    );

    const text = await response.text();
    const data = safeParseResponse(text);

    if (response.status === 401 && !skipAuth) {
      await tokenStorage.remove();
      triggerLogout();
      const unauthorizedError: ApiError = new Error(
        data?.error?.message || 'UNAUTHORIZED'
      );
      unauthorizedError.status = 401;
      unauthorizedError.payload = data;
      throw unauthorizedError;
    }

    if (!response.ok) {
      const error: ApiError = new Error(
        data?.error?.message ||
        data?.message ||
        i18n.t('errors.server')
      );
      error.status = response.status;
      error.payload = data;
      throw error;
    }

    if (data?.success === false) {
      const error: ApiError = new Error(data?.error?.message || i18n.t('errors.server'));
      error.status = response.status;
      error.payload = data;
      throw error;
    }

    return data as T;

  } catch (e: any) {
    if (e.name === 'AbortError') {
      throw e;
    }

    if (isNetworkError(e)) {
      throw new Error(i18n.t('errors.server'));
    }

    if (retry > 0) {
      return api(endpoint, { ...options, retry: retry - 1 });
    }

    throw e;
  }
}
