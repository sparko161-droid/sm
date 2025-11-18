import SupportFilters from "/sm/js/modules/support/support-filters.js";
import SupportAccordions from "/sm/js/modules/support/support-accordions.js";
import SupportTemplates from "/sm/js/modules/support/support-templates.js";
import SupportProbation from "/sm/js/modules/support/support-probation.js";
import ProbationTable from "/sm/js/modules/support/probation-table.js";
import { initL1Calculator } from "/sm/js/calculators/l1.js";
import { initL2Calculator } from "/sm/js/calculators/l2.js";

// Квизы
import { QuizRegistry } from "/sm/js/modules/quiz/registry.js";
import { QuizEngine } from "/sm/js/modules/quiz/engine.js";

export function initSupportInteractions(container) {
  if (!container) return;

  try {
    SupportFilters.init(container);
  } catch (e) {
    console.warn('[Support] Filters init failed', e);
  }

  try {
    SupportAccordions.init(container);
  } catch (e) {
    console.warn('[Support] Accordions init failed', e);
  }

  try {
    SupportTemplates.init(container);
  } catch (e) {
    console.warn('[Support] Templates init failed', e);
  }

  try {
    ProbationTable.init(container);
  } catch (e) {
    console.warn('[Support] ProbationTable init failed', e);
  }

  try {
    SupportProbation.init(container);
  } catch (e) {
    console.warn('[Support] SupportProbation init failed', e);
  }

  try {
    initL1Calculator(container);
  } catch (e) {
    console.warn('[Support] L1 calculator init failed', e);
  }

  try {
    initL2Calculator(container);
  } catch (e) {
    console.warn('[Support] L2 calculator init failed', e);
  }

  // Попап квизов
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

      // Клик по фону — тоже закрываем (но не по диалогу)
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          closePopup();
        }
      });

      const openQuiz = async (section, quizId) => {
        const category = section || "support";
        const jsonPath = QuizRegistry[category];
        if (!jsonPath) return;

        try {
          const res = await fetch(jsonPath);
          if (!res.ok) throw new Error("HTTP " + res.status);
          const data = await res.json();
          const quizzes = data.quizzes || [];
          const quizData =
            quizzes.find((q) => q.id === quizId) || quizzes[0] || null;

          if (!quizData) return;

          backdrop.removeAttribute("hidden");
          backdrop.classList.add("is-open");

          await QuizEngine.run(quizData, quizContainer, {
            onClose: closePopup,
          });
        } catch (err) {
          console.error("[Support] Failed to open quiz", err);
        }
      };

      const quizTriggers = Array.from(
        container.querySelectorAll(".quiz-trigger[data-quiz]")
      );

      quizTriggers.forEach((btn) => {
        btn.addEventListener("click", (event) => {
          event.preventDefault();
          const section = btn.dataset.quizSection || "support";
          const quizId = btn.dataset.quiz || "";
          openQuiz(section, quizId);
        });
      });
    }
  } catch (e) {
    console.warn("[Support] Quiz triggers init failed", e);
  }
}
