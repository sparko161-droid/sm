/**
 * GitHub Client · SM Codex Portal
 *
 * Универсальный клиент для чтения файлов из GitHub репозитория.
 * Используется только для чтения JSON/текста, без записи.
 *
 * В реальной среде значения OWNER/REPO/BRANCH/API_BASE могут быть
 * переопределены через процесс сборки или инлайном в HTML.
 */

const DEFAULT_GITHUB_CONFIG = {
  owner: window.SM_GITHUB_OWNER || "",
  repo: window.SM_GITHUB_REPO || "",
  branch: window.SM_GITHUB_BRANCH || "main",
  apiBase: window.SM_GITHUB_API_BASE || "https://api.github.com"
};

function buildContentsUrl(path, config = DEFAULT_GITHUB_CONFIG) {
  const owner = config.owner;
  const repo = config.repo;
  const apiBase = config.apiBase.replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  return `${apiBase}/repos/${owner}/${repo}/contents/${cleanPath}`;
}

async function fetchFromGitHub(path, options = {}) {
  const cfg = { ...DEFAULT_GITHUB_CONFIG, ...(options.config || {}) };

  if (!cfg.owner || !cfg.repo) {
    throw new Error("GitHub client: owner/repo are not configured.");
  }

  const url = buildContentsUrl(path, cfg);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/vnd.github.v3+json"
    }
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const err = new Error(`GitHub client: HTTP ${response.status} for ${url}`);
    err.status = response.status;
    err.body = text;
    throw err;
  }

  const data = await response.json();
  return data;
}

/**
 * Чтение JSON-файла из репозитория (через GitHub Contents API).
 *
 * @param {string} path - путь к файлу внутри репозитория (например, "content/sections.json")
 * @param {object} options - опции (config и т.п.)
 * @returns {Promise<any>} распарсенный JSON-объект
 */
export async function fetchJsonFile(path, options = {}) {
  const data = await fetchFromGitHub(path, options);

  if (data && typeof data.content === "string") {
    const decoded = atob(data.content.replace(/\n/g, ""));
    try {
      return JSON.parse(decoded);
    } catch (err) {
      console.error("GitHub client: JSON parse error for", path, err);
      throw err;
    }
  }

  throw new Error("GitHub client: unexpected response shape for JSON file.");
}

/**
 * Чтение текстового файла из репозитория.
 *
 * @param {string} path
 * @param {object} options
 * @returns {Promise<string>}
 */
export async function fetchTextFile(path, options = {}) {
  const data = await fetchFromGitHub(path, options);

  if (data && typeof data.content === "string") {
    return atob(data.content.replace(/\n/g, ""));
  }

  throw new Error("GitHub client: unexpected response shape for text file.");
}

/**
 * Позволяет переопределить конфиг GitHub-клиента на уровне рантайма.
 * Например, можно вызвать из main.js:
 *
 *   setGithubConfig({ owner: "org", repo: "sm-codex", branch: "main" });
 *
 * или задать глобальные переменные window.SM_GITHUB_*.
 */
let runtimeConfig = { ...DEFAULT_GITHUB_CONFIG };

export function setGithubConfig(partial) {
  runtimeConfig = { ...runtimeConfig, ...(partial || {}) };
}

export function getGithubConfig() {
  return { ...runtimeConfig };
}

// Экспорт по умолчанию — удобный фасад
const GitHubClient = {
  fetchJsonFile,
  fetchTextFile,
  setGithubConfig,
  getGithubConfig
};

export default GitHubClient;
