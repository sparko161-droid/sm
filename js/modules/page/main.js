import { AppState } from "/sm/js/core/state.js";
import ContentService from "/sm/js/core/contentService.js";
import StepRenderer from "/sm/js/core/stepRenderer.js";

function parsePageSlugFromHash() {
  const hash = window.location.hash || "";
  const clean = hash.replace(/^#\/?/, "");
  const parts = clean.split("/");
  // ожидаем формат: #page/{slug}
  if (parts[0] !== "page" || !parts[1]) {
    return null;
  }
  return parts[1];
}

function findPageBySlug(slug) {
  if (!slug) return null;
  const data = AppState.sections;
  if (!data || !Array.isArray(data.sections)) return null;

  for (const section of data.sections) {
    if (!Array.isArray(section.pages)) continue;
    for (const page of section.pages) {
      if (page.id === slug || page.slug === slug) {
        return page;
      }
    }
  }
  return null;
}

export default {
  name: "page",

  async init(container) {
    container.innerHTML = `<div class="page"><p>Загрузка страницы...</p></div>`;

    // Убедимся, что sections загружены
    if (!AppState.sections) {
      await ContentService.loadSections();
    }

    const slug = parsePageSlugFromHash();
    if (!slug) {
      container.innerHTML = `<section class="page"><h2>Страница не найдена</h2><p>Не указан slug страницы в маршруте #page/:slug.</p></section>`;
      return;
    }

    const pageMeta = findPageBySlug(slug);
    if (!pageMeta) {
      container.innerHTML = `<section class="page"><h2>Страница не найдена</h2><p>Не удалось найти страницу по slug: <code>${slug}</code>.</p></section>`;
      return;
    }

    const pagePath = pageMeta.pagePath;
    if (!pagePath) {
      container.innerHTML = `<section class="page"><h2>Страница не настроена</h2><p>Для страницы <code>${slug}</code> не указан pagePath в sections.json.</p></section>`;
      return;
    }

    try {
      const pageJson = await ContentService.loadPage(pagePath);
      if (!pageJson) {
        container.innerHTML = `<section class="page"><h2>Ошибка загрузки</h2><p>Не удалось загрузить JSON страницы: <code>${pagePath}</code>.</p></section>`;
        return;
      }

      const renderer = new StepRenderer(container, pageJson);
      renderer.init();
    } catch (err) {
      console.error("[PageModule] Failed to load page", err);
      container.innerHTML = `<section class="page"><h2>Ошибка</h2><p>${String(err)}</p></section>`;
    }
  }
};
