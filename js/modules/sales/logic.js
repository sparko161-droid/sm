
import { initSalesHunterCalculator, initSalesClientCalculator } from "/sm/js/calculators/sales.js";

export function initSalesInteractions(container) {
  if (!container) return;

  // Sticky navigation inside sales section
  try {
    const nav = container.querySelector(".sales-toolbar .subnav-lines[data-role=\"sales-nav\"]");
    if (nav) {
      const pills = Array.from(nav.querySelectorAll(".subnav-pill[data-target]"));
      const sections = Array.from(container.querySelectorAll("[data-sales-section]"));
      const map = new Map();
      sections.forEach((sec) => {
        const id = sec.getAttribute("data-sales-section");
        if (id) map.set(id, sec);
      });

      const activate = (target) => {
        pills.forEach((p) => p.classList.toggle("active", p.dataset.target === target));
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
    console.warn("[Sales] nav init failed", e);
  }

  try {
    initSalesHunterCalculator(container);
    initSalesClientCalculator(container);
  } catch (e) {
    console.warn("[Sales] calculators init failed", e);
  }
}
