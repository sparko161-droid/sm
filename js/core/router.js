// Простой hash-based роутер с lazy-loading модулей страниц

export const Router = {
  /** @type {Map<string, () => Promise<any>>} */
  routes: new Map(),
  currentRoute: null,
  currentModule: null,

  register(name, loader) {
    this.routes.set(name, loader);
  },

  init() {
    window.addEventListener("hashchange", () => this.loadFromLocation());
    window.addEventListener("DOMContentLoaded", () => this.loadFromLocation());
    this.loadFromLocation();
  },

  getRouteName() {
    const hash = window.location.hash.slice(1); // без #
    if (!hash) return "dashboard";
    return hash.split("?")[0];
  },

  async loadFromLocation() {
    const name = this.getRouteName();
    const container = document.getElementById("content");

    if (!container) {
      console.error("[Router] #content not found");
      return;
    }

    if (!this.routes.has(name)) {
      container.innerHTML = `<h2>404 — Раздел не найден</h2>`;
      return;
    }

    // destroy старого модуля
    if (this.currentModule && typeof this.currentModule.destroy === "function") {
      try {
        this.currentModule.destroy();
      } catch (e) {
        console.warn("[Router] destroy error:", e);
      }
    }

    this.currentRoute = name;
    container.innerHTML = `<p>Загрузка раздела <strong>${name}</strong>…</p>`;

    try {
      const loader = this.routes.get(name);
      const module = await loader();
      const page = module.default;

      if (!page || typeof page.init !== "function") {
        container.innerHTML = `<h2>Ошибка: модуль страницы не экспортирует init()</h2>`;
        return;
      }

      this.currentModule = page;
      await page.init(container);
    } catch (err) {
      console.error("[Router] Failed to load route", name, err);
      container.innerHTML = `<h2>Ошибка загрузки раздела</h2><p>${String(err)}</p>`;
    }
  }
};
