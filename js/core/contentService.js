import GitHubClient, { fetchJsonFile } from "/sm/js/core/githubClient.js";
import { AppState } from "/sm/js/core/state.js";

const CONTENT_BASE_PATH = "content";

async function safeFetchJson(path) {
  try {
    return await fetchJsonFile(path);
  } catch (err) {
    console.warn("[ContentService] Failed to load", path, err);
    return null;
  }
}

export async function loadSections() {
  const data = await safeFetchJson(`${CONTENT_BASE_PATH}/sections.json`);
  if (data) {
    AppState.sections = data;
  }
  return data;
}

export async function loadFilters() {
  const data = await safeFetchJson(`${CONTENT_BASE_PATH}/filters.json`);
  if (data) {
    AppState.filters = data;
  }
  return data;
}

export async function loadCalculators() {
  const data = await safeFetchJson(`${CONTENT_BASE_PATH}/calculators.json`);
  if (data) {
    AppState.calculators = data;
  }
  return data;
}

export async function loadPage(pagePath) {
  if (!pagePath) {
    throw new Error("[ContentService] pagePath is required");
  }

  AppState.pages = AppState.pages || {};
  if (AppState.pages[pagePath]) {
    return AppState.pages[pagePath];
  }

  const data = await safeFetchJson(`${CONTENT_BASE_PATH}/pages/${pagePath}`);
  if (data) {
    AppState.pages[pagePath] = data;
  }
  return data;
}

/**
 * Предзагрузка базового контента (sections, filters, calculators).
 * Вызывается один раз при старте приложения.
 */
export async function preloadContent() {
  const [sections, filters, calculators] = await Promise.all([
    loadSections(),
    loadFilters(),
    loadCalculators()
  ]);

  return { sections, filters, calculators };
}

const ContentService = {
  preloadContent,
  loadSections,
  loadFilters,
  loadCalculators,
  loadPage
};

export default ContentService;
