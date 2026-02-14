import { triggerLogout } from "../../features/auth/authBridge";
import { tokenStorage } from "../lib/tokenStorage";

const BASE_URL = 'https://api.alloplay.uz/api/v1';
const TIMEOUT = 10000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  retry?: number;
  signal?: AbortSignal; // ✅ qo‘shildi
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
  } = options;

  try {
    const token = await tokenStorage.get();

    const response = await fetchWithTimeout(
      `${BASE_URL}${endpoint}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      },
      TIMEOUT,
      signal
    );

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (response.status === 401) {
      await tokenStorage.remove();
      triggerLogout();
      throw new Error(data?.error?.message || 'UNAUTHORIZED');
    }

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
        data?.message ||
        'Ошибка сервера'
      );
    }

    if (data?.success === false) {
      throw new Error(data?.error?.message);
    }

    return data as T;

  } catch (e: any) {
    if (e.name === 'AbortError') {
      throw e; // abortni swallow qilmaymiz
    }

    if (retry > 0) {
      return api(endpoint, { ...options, retry: retry - 1 });
    }

    throw e;
  }
}
