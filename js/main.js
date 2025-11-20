import { Router } from "/sm/js/core/router.js";
import { Theme } from "/sm/js/core/theme.js";
import { initQuizPopupGlobal } from "/sm/js/modules/quiz/popup.js";
import ContentService from "/sm/js/core/contentService.js";

// Регистрация роутов (ленивая загрузка модулей страниц)
Router.register("dashboard", () => import("/sm/js/modules/results/main.js")); // временно
Router.register("support", () => import("/sm/js/modules/support/main.js"));
Router.register("sales", () => import("/sm/js/modules/sales/main.js"));
Router.register("operations", () => import("/sm/js/modules/operations/main.js"));
Router.register("implementation", () => import("/sm/js/modules/implementation/main.js"));
Router.register("results", () => import("/sm/js/modules/results/main.js"));
Router.register("quiz", () => import("/sm/js/modules/quiz/main.js"));
Router.register("calculators", () => import("/sm/js/modules/calculators/main.js"));
Router.register("constructor", () => import("/sm/js/modules/constructor/main.js"));
Router.register("page", () => import("/sm/js/modules/page/main.js"));

async function bootstrap() {
  // Тема и базовые вещи
  Theme.init();

  // Предзагрузка контента из GitHub backend (sections, filters, calculators).
  try {
    await ContentService.preloadContent();
  } catch (err) {
    console.warn("[Bootstrap] Failed to preload content", err);
  }

  // Роутер и глобальные попапы
  Router.init();
  initQuizPopupGlobal();
}

bootstrap();
