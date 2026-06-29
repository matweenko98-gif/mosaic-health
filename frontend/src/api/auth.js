import { api, setAccessToken } from './client';

/**
 * Функции авторизации поверх клиента API.
 * Сервер возвращает { user, accessToken } и ставит refresh-cookie.
 */

export async function login(email, password) {
  const data = await api.post('/auth/login', { email, password });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function register(payload) {
  const data = await api.post('/auth/register', payload);
  setAccessToken(data.accessToken);
  return data.user;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    setAccessToken(null);
  }
}

/**
 * Восстановление сессии при загрузке: пробуем обновить токен по cookie,
 * затем запрашиваем профиль. Возвращает пользователя или null.
 */
export async function restoreSession() {
  try {
    const data = await api.post('/auth/refresh');
    setAccessToken(data.accessToken);
    return data.user;
  } catch {
    return null;
  }
}

export function forgotPassword(email) {
  return api.post('/auth/forgot-password', { email });
}

export function resetPassword(token, password) {
  return api.post('/auth/reset-password', { token, password });
}
