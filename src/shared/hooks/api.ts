const BASE_URL = 'https://api.alloplay.uz/api/v1';
const TIMEOUT = 10000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: any;
  token?: string;
  headers?: Record<string, string>;
  retry?: number;
}

function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('REQUEST_TIMEOUT'));
    }, timeout);

    fetch(url, options)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function api<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    token,
    headers = {},
    retry = 0,
  } = options;

  try {
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
      TIMEOUT
    );

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (response.status === 401) {
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
  } catch (e) {
    if (retry > 0) {
      return api(endpoint, { ...options, retry: retry - 1 });
    }
    throw e;
  }
}
