import { QuizRegistry } from "/sm/js/modules/quiz/registry.js";
import { QuizEngine } from "/sm/js/modules/quiz/engine.js";
import { parseHashQuery } from "/sm/js/core/utils.js";

const QuizPage = {
  name: "quiz",
  async init(container) {
    const params = parseHashQuery();
    const category = params.category || "support";
    const quizId = params.quiz || null;

    const jsonPath = QuizRegistry[category];
    if (!jsonPath) {
      container.innerHTML = `<section class="page page--quiz"><h1>Квиз</h1><p>Неизвестная категория квиза: <code>${category}</code></p></section>`;
      return;
    }

    try {
      const res = await fetch(jsonPath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      let quizData = null;

      if (quizId) {
        const quizzes = data.quizzes || [];
        quizData = quizzes.find((q) => q.id === quizId) || null;
      }

      if (!quizData) {
        // если конкретный квиз не указан, можно взять первый
        const quizzes = data.quizzes || [];
        if (quizzes.length > 0) {
          quizData = quizzes[0];
        }
      }

      if (!quizData) {
        container.innerHTML = `
          <section class="page page--quiz">
            <h1>${data.title || "Квизы"}</h1>
            <p>Для этой категории пока нет настроенных квизов.</p>
          </section>
        `;
        return;
      }

      await QuizEngine.run(quizData, container);
    } catch (err) {
      console.error("[QuizPage] Failed to load quiz", err);
      container.innerHTML = `
        <section class="page page--quiz">
          <h1>Квиз</h1>
          <p>Ошибка загрузки данных квиза.</p>
          <pre>${String(err)}</pre>
        </section>
      `;
    }
  },
  destroy() {
    // пока ничего, можно будет добавить очистку слушателей
  }
};

export default QuizPage;
