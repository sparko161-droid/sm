// js/api/constructorApi.js
//
// Клиент для работы конструктора с n8n-хуком:
//   POST https://jolikcisout.beget.app/webhook/sm/constructor/save-page
//
// SPA не знает токенов/секретов GitHub — только вызывает n8n.

const DEFAULT_N8N_SAVE_PAGE_URL = "https://jolikcisout.beget.app/webhook/sm/constructor/save-page";

function getSavePageUrl() {
  if (typeof window !== "undefined" && window.SM_N8N_SAVE_PAGE_URL) {
    return window.SM_N8N_SAVE_PAGE_URL;
  }
  return DEFAULT_N8N_SAVE_PAGE_URL;
}

async function callN8N(payload) {
  const url = getSavePageUrl();

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

  // HTTP-ошибка уровня транспорта
  if (!response.ok) {
    const msg = (data && data.error) || response.statusText || "HTTP error";
    throw new Error("Ошибка n8n: " + msg);
  }

  // Логический флаг ok в нашем контракте
  if (!data.ok) {
    throw new Error(data.error || "Операция n8n завершилась с ошибкой");
  }

  return data;
}

/**
 * Сохранение (создание/обновление) страницы.
 *
 * @param {string} pagePath - путь внутри content/pages, например "support/main.json"
 * @param {object} pageJson - полный JSON страницы (steps + blocks)
 * @param {object} [options]
 * @param {string|null} [options.sha] - предыдущий sha, если есть (может быть null)
 * @param {string} [options.commitMessage] - сообщение коммита
 * @param {object} [options.author] - произвольные метаданные автора
 */
export async function upsertPage(pagePath, pageJson, options = {}) {
  if (!pagePath) {
    throw new Error("pagePath обязателен для сохранения страницы");
  }
  if (!pageJson || typeof pageJson !== "object") {
    throw new Error("pageJson (object) обязателен для сохранения страницы");
  }

  const payload = {
    op: "upsert",
    pagePath,
    pageJson,
    sha: options.sha || null,
    commitMessage: options.commitMessage || `Update ${pagePath} via constructor`,
    author: options.author || {
      source: "constructor-ui"
    }
  };

  return callN8N(payload);
}

/**
 * Удаление страницы из репозитория.
 *
 * @param {string} pagePath - путь внутри content/pages
 * @param {object} [options]
 * @param {string|null} [options.sha] - sha файла, если известен (может быть null, если n8n сам его получает)
 * @param {string} [options.commitMessage] - сообщение коммита
 * @param {object} [options.author] - произвольные метаданные автора
 */
export async function deletePage(pagePath, options = {}) {
  if (!pagePath) {
    throw new Error("pagePath обязателен для удаления страницы");
  }

  const payload = {
    op: "delete",
    pagePath,
    sha: options.sha || null,
    commitMessage: options.commitMessage || `Delete ${pagePath} via constructor`,
    author: options.author || {
      source: "constructor-ui"
    }
  };

  return callN8N(payload);
}
