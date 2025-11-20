
import { initImplementationCalculator } from "/sm/js/calculators/implementation.js";

export function initImplementationInteractions(container) {
  if (!container) return;

  // Калькулятор
  try {
    initImplementationCalculator(container);
  } catch (e) {
    console.warn("[Implementation] Calculator init failed", e);
  }

  // Локальная навигация по разделу (sticky меню)
  try {
    const nav = container.querySelector(".implementation-toolbar .subnav-lines[data-role=\"implementation-nav\"]");
    if (nav) {
      const pills = Array.from(nav.querySelectorAll(".subnav-pill[data-target]"));
      const sections = Array.from(container.querySelectorAll("[data-impl-section]"));

      const map = new Map();
      sections.forEach((sec) => {
        const id = sec.getAttribute("data-impl-section");
        if (id) map.set(id, sec);
      });

      const activate = (target) => {
        pills.forEach((p) => {
          p.classList.toggle("active", p.dataset.target === target);
        });
      };

      pills.forEach((pill) => {
        pill.addEventListener("click", (e) => {
          e.preventDefault();
          const target = pill.dataset.target;
          if (!target) return;
          const section = map.get(target);
          if (!section) return;

          section.scrollIntoView({ behavior: "smooth", block: "start" });
          activate(target);
        });
      });
    }
  } catch (e) {
    console.warn("[Implementation] local nav init failed", e);
  }
}
