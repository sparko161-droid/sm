// js/api/calcAuthApi.js
//
// Клиент для авторизации доступа к калькуляторам через n8n-хук `/calc-auth`.
// SPA не хранит пароли и не знает секреты — только передаёт их в n8n.

const DEFAULT_N8N_CALC_AUTH_URL = "https://jolikcisout.beget.app/webhook/sm/calc-auth";

function getCalcAuthUrl() {
  if (typeof window !== "undefined" && window.SM_N8N_CALC_AUTH_URL) {
    return window.SM_N8N_CALC_AUTH_URL;
  }
  return DEFAULT_N8N_CALC_AUTH_URL;
}

async function callCalcAuth(payload) {
  const url = getCalcAuthUrl();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error("Некорректный ответ от n8n (не JSON)");
  }

  if (!response.ok) {
    const msg = (data && data.error) || response.statusText || "HTTP error";
    throw new Error("Ошибка n8n: " + msg);
  }

  if (!data.ok) {
    throw new Error(data.error || "Операция calc-auth завершилась с ошибкой");
  }

  return data;
}

/**
 * Авторизация доступа к калькулятору.
 *
 * @param {string} slug - слаг калькулятора (из calculators.json)
 * @param {string} password - пароль, введённый пользователем
 */
export async function authCalc(slug, password) {
  if (!slug) {
    throw new Error("slug калькулятора обязателен");
  }
  if (!password) {
    throw new Error("Пароль обязателен");
  }

  const payload = {
    op: "calc-auth",
    slug,
    password
  };

  return callCalcAuth(payload);
}
