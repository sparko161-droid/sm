
import { QuizRegistry } from "/sm/js/modules/quiz/registry.js";
import { QuizEngine } from "/sm/js/modules/quiz/engine.js";

let backdropEl = null;
let dialogEl = null;
let bodyEl = null;
let closeBtnEl = null;
let isInit = false;

function ensureElements() {
  if (backdropEl) return;

  backdropEl = document.createElement("div");
  backdropEl.className = "quiz-backdrop";
  backdropEl.dataset.quizPopup = "1";
  backdropEl.setAttribute("hidden", "hidden");

  dialogEl = document.createElement("div");
  dialogEl.className = "quiz-dialog";

  closeBtnEl = document.createElement("button");
  closeBtnEl.type = "button";
  closeBtnEl.className = "quiz-close";
  closeBtnEl.dataset.quizPopupClose = "1";
  closeBtnEl.innerHTML = "×";

  bodyEl = document.createElement("div");
  bodyEl.className = "quiz-dialog-body";
  bodyEl.dataset.quizPopupBody = "1";

  dialogEl.appendChild(closeBtnEl);
  dialogEl.appendChild(bodyEl);
  backdropEl.appendChild(dialogEl);
  document.body.appendChild(backdropEl);

  closeBtnEl.addEventListener("click", () => {
    closeQuizPopup();
  });

  backdropEl.addEventListener("click", (e) => {
    if (e.target === backdropEl) {
      closeQuizPopup();
    }
  });
}

export function closeQuizPopup() {
  if (!backdropEl) return;
  backdropEl.classList.remove("is-open");
  backdropEl.setAttribute("hidden", "hidden");
  if (bodyEl) {
    bodyEl.innerHTML = "";
  }
}

export async function openQuizPopup(category, quizId) {
  ensureElements();

  try {
    const src = QuizRegistry[category];
    if (!src) {
      console.warn("[QuizPopup] Unknown category:", category);
      return;
    }
    const res = await fetch(src, { cache: "no-cache" });
    if (!res.ok) throw new Error("Failed to load quiz json: " + src);
    const data = await res.json();
    const list = Array.isArray(data.quizzes) ? data.quizzes : [];
    const quizData = list.find((q) => q.id === quizId) || list[0];
    if (!quizData) {
      console.warn("[QuizPopup] No quiz found in json:", src);
      return;
    }

    backdropEl.removeAttribute("hidden");
    backdropEl.classList.add("is-open");

    await QuizEngine.run(quizData, bodyEl, {
      onClose: () => {
        closeQuizPopup();
      }
    });
  } catch (err) {
    console.error("[QuizPopup] Failed to open quiz", err);
  }
}

export function initQuizPopupGlobal() {
  if (isInit) return;
  isInit = true;
  ensureElements();

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    // Поддержка вложенных элементов (иконка внутри кнопки и т.п.)
    const trigger = target.closest("[data-quiz-id]");
    if (!trigger) return;

    const category = trigger.getAttribute("data-quiz-category") || trigger.getAttribute("data-quiz") || "support";
    const quizId = trigger.getAttribute("data-quiz-id") || trigger.getAttribute("data-quiz");

    if (!quizId || !category) return;

    event.preventDefault();
    openQuizPopup(category, quizId);
  });
}
