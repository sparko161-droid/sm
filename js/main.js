import { Router } from "/sm/js/core/router.js";
import { Theme } from "/sm/js/core/theme.js";
import { initQuizPopupGlobal } from "/sm/js/modules/quiz/popup.js";

// Регистрация роутов (ленивая загрузка модулей страниц)
Router.register("dashboard", () => import("/sm/js/modules/results/main.js")); // временно
Router.register("support", () => import("/sm/js/modules/support/main.js"));
Router.register("sales", () => import("/sm/js/modules/sales/main.js"));
Router.register("operations", () => import("/sm/js/modules/operations/main.js"));
Router.register("implementation", () => import("/sm/js/modules/implementation/main.js"));
Router.register("results", () => import("/sm/js/modules/results/main.js"));
Router.register("quiz", () => import("/sm/js/modules/quiz/main.js"));

// Инициализация
Theme.init();
Router.init();
initQuizPopupGlobal();
