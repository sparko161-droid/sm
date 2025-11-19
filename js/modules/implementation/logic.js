import { initImplementationCalculator } from "/sm/js/calculators/implementation.js";
import { QuizRegistry } from "/sm/js/modules/quiz/registry.js";
import { QuizEngine } from "/sm/js/modules/quiz/engine.js";

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

  // Локальные квизы (попап внутри раздела)
  try {
    const backdrop = container.querySelector("[data-quiz-backdrop]");
    const quizContainer = backdrop?.querySelector("[data-quiz-container]");
    const closeBtn = backdrop?.querySelector("[data-quiz-close]");

    if (backdrop && quizContainer) {
      const closePopup = () => {
        backdrop.classList.remove("is-open");
        backdrop.setAttribute("hidden", "hidden");
        quizContainer.innerHTML = "";
      };

      if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          closePopup();
        });
      }

      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          closePopup();
        }
      });

      const openQuiz = async (quizId) => {
        try {
          const url = QuizRegistry.implementation;
          const res = await fetch(url, { cache: "no-cache" });
          if (!res.ok) throw new Error("Failed to load implementation quiz JSON");
          const data = await res.json();
          const quizzes = Array.isArray(data.quizzes) ? data.quizzes : [];
          const quizData = quizzes.find((q) => q.id === quizId) || quizzes[0] || null;
          if (!quizData) return;

          backdrop.removeAttribute("hidden");
          backdrop.classList.add("is-open");

          await QuizEngine.run(quizData, quizContainer, {
            onClose: closePopup
          });
        } catch (err) {
          console.error("[Implementation] Failed to open quiz", err);
        }
      };

      const triggers = Array.from(container.querySelectorAll(".quiz-trigger[data-quiz]"));
      triggers.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const quizId = btn.dataset.quiz || "";
          if (!quizId) return;
          openQuiz(quizId);
        });
      });
    }
  } catch (e) {
    console.warn("[Implementation] quiz triggers init failed", e);
  }
}
