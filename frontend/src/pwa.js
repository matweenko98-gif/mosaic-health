/**
 * PWA: регистрация service worker'а, установка приложения и подписка на push.
 */
import { api } from "./api/client";

let swRegistration = null;

/** Регистрируем service worker (только в собранной версии, чтобы не мешать HMR в dev). */
export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  if (!import.meta.env.PROD) return null;
  try {
    swRegistration = await navigator.serviceWorker.register("/sw.js");
    return swRegistration;
  } catch (e) {
    console.warn("Не удалось зарегистрировать service worker:", e);
    return null;
  }
}

async function getRegistration() {
  if (swRegistration) return swRegistration;
  if (!("serviceWorker" in navigator)) return null;
  swRegistration = (await navigator.serviceWorker.getRegistration()) || null;
  return swRegistration;
}

/** Поддерживает ли устройство web-push (на iOS — только в «установленном» приложении). */
export function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/** Текущее состояние: подписан ли пользователь на push. */
export async function getPushState() {
  if (!isPushSupported()) return { supported: false, subscribed: false };
  const reg = await getRegistration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  return { supported: true, subscribed: !!sub, permission: Notification.permission };
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/**
 * Подписка на push: спрашивает разрешение, подписывается и отправляет подписку на сервер.
 * Возвращает true при успехе. Если push на сервере выключен (нет VAPID) — вернёт false.
 */
export async function subscribeToPush() {
  if (!isPushSupported()) return false;
  const reg = await getRegistration();
  if (!reg) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const { key } = await api.get("/push/vapid-public-key").catch(() => ({ key: null }));
  if (!key) return false; // push на сервере не настроен

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key),
  });

  const json = sub.toJSON();
  await api.post("/me/push/subscribe", {
    endpoint: sub.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  });
  return true;
}

/** Отписка от push: снимает подписку в браузере и на сервере. */
export async function unsubscribeFromPush() {
  const reg = await getRegistration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  if (!sub) return true;
  const endpoint = sub.endpoint;
  await sub.unsubscribe().catch(() => {});
  await api.post("/me/push/unsubscribe", { endpoint }).catch(() => {});
  return true;
}
