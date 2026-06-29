/**
 * Клиент для общения с сервером (бэкендом).
 * Хранит токен входа в памяти, сам добавляет его к запросам
 * и при истечении сессии пытается её обновить.
 */

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function normalizeMessage(data, fallback) {
  if (!data) return fallback;
  const m = data.message;
  if (Array.isArray(m)) return m.join('; ');
  return m || fallback;
}

let refreshing = null;

async function tryRefresh() {
  // Один общий запрос обновления, даже если параллельно прилетело несколько 401.
  if (!refreshing) {
    refreshing = fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = await res.json().catch(() => null);
        if (data?.accessToken) {
          setAccessToken(data.accessToken);
          return true;
        }
        return false;
      })
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

async function request(path, { method = 'GET', body, headers, _retry } = {}) {
  const res = await fetch('/api' + path, {
    method,
    credentials: 'include',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(headers || {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  // Сессия истекла — пробуем обновить и повторить запрос один раз.
  const isAuthFlow = path.startsWith('/auth/refresh') || path.startsWith('/auth/login') || path.startsWith('/auth/register');
  if (res.status === 401 && !_retry && !isAuthFlow) {
    const ok = await tryRefresh();
    if (ok) return request(path, { method, body, headers, _retry: true });
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, normalizeMessage(data, 'Ошибка запроса'), data);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  request,
};
