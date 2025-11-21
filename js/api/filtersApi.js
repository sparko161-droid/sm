// js/api/filtersApi.js
//
// Клиент для сохранения filters.json через n8n-хук.
// SPA не знает токенов/секретов, только вызывает webhook.

const DEFAULT_N8N_SAVE_FILTERS_URL = "https://jolikcisout.beget.app/webhook/sm/constructor/save-filters";

function getSaveFiltersUrl() {
  if (typeof window !== "undefined" && window.SM_N8N_SAVE_FILTERS_URL) {
    return window.SM_N8N_SAVE_FILTERS_URL;
  }
  return DEFAULT_N8N_SAVE_FILTERS_URL;
}

async function callN8N(payload) {
  const url = getSaveFiltersUrl();

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
    throw new Error(data.error || "Операция n8n завершилась с ошибкой");
  }

  return data;
}

/**
 * Сохранение filters.json в GitHub через n8n.
 *
 * @param {object} filtersJson - полный JSON объекта filters (lines, caseTypes, categories).
 * @param {object} [options]
 * @param {string|null} [options.sha] - предыдущий sha файла filters.json (может быть null).
 * @param {string} [options.commitMessage] - сообщение коммита.
 * @param {object} [options.author] - произвольные метаданные автора.
 */
export async function saveFilters(filtersJson, options = {}) {
  if (!filtersJson || typeof filtersJson !== "object") {
    throw new Error("filtersJson (object) обязателен для сохранения filters.json");
  }

  const payload = {
    op: "upsert-filters",
    filtersJson,
    sha: options.sha || null,
    commitMessage: options.commitMessage || "Update filters.json via filters-editor",
    author: options.author || {
      source: "filters-editor-ui"
    }
  };

  return callN8N(payload);
}
