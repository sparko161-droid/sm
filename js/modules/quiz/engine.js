import { delay } from "/sm/js/core/utils.js";

function createInitialState(quiz) {
  return {
    currentIndex: 0,
    completed: false,
    answers: [],
    quiz
  };
}

function renderQuestion(container, state, options = {}) {
  const { quiz, currentIndex } = state;
  const question = quiz.questions[currentIndex];
  const total = quiz.questions.length;

  container.innerHTML = `
    <section class="page page--quiz">
      <header class="quiz-header">
        <div class="quiz-title">${quiz.title || "Квиз"}</div>
        <div class="quiz-progress">Вопрос ${currentIndex + 1} из ${total}</div>
      </header>
      <article class="quiz-card">
        <div class="quiz-question">${question.prompt}</div>
        <div class="quiz-options" data-quiz-options></div>
        <div class="quiz-feedback" data-quiz-feedback></div>
      </article>
      <footer class="quiz-footer">
        <button type="button" class="btn" data-quiz-next disabled>Следующий вопрос</button>
      </footer>
    </section>
  `;

  const optionsRoot = container.querySelector("[data-quiz-options]");
  const feedbackEl = container.querySelector("[data-quiz-feedback]");
  const nextBtn = container.querySelector("[data-quiz-next]");

  question.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-ghost quiz-option";
    btn.textContent = opt.text;
    btn.dataset.index = String(idx);
    optionsRoot.appendChild(btn);
  });

  let answered = false;

  optionsRoot.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || answered) return;
    const btn = target.closest(".quiz-option");
    if (!btn) return;

    const idx = Number(btn.dataset.index ?? -1);
    if (Number.isNaN(idx) || idx < 0) return;

    const opt = question.options[idx];
    const correct = !!opt.correct;

    // Запоминаем ответ (только один раз на вопрос)
    state.answers.push({
      questionIndex: currentIndex,
      optionIndex: idx,
      correct
    });

    // Подсветка вариантов
    optionsRoot.querySelectorAll(".quiz-option").forEach((el, optionIndex) => {
      el.classList.remove("quiz-option--selected", "quiz-option--correct", "quiz-option--wrong");
      const optionData = question.options[optionIndex];
      if (optionData.correct) {
        el.classList.add("quiz-option--correct");
      }
      if (optionIndex === idx && !optionData.correct) {
        el.classList.add("quiz-option--wrong");
      }
    });

    // Фидбек
    let feedbackHtml = "";
    if (opt.note) {
      feedbackHtml = opt.note;
    } else if (correct) {
      feedbackHtml = "✅ Верно!";
    } else {
      feedbackHtml = "❌ Не совсем так. Посмотри пояснение.";
    }
    feedbackEl.innerHTML = feedbackHtml;

    answered = true;
    if (nextBtn) {
      nextBtn.disabled = false;
    }
  });

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (!answered) return;

      const nextIndex = currentIndex + 1;
      if (nextIndex < total) {
        state.currentIndex = nextIndex;
        renderQuestion(container, state, options);
      } else {
        state.completed = true;
        renderSummary(container, state, options);
      }
    });
  }
}

function renderSummary(container, state, options = {}) {
  const { quiz, answers } = state;
  const total = quiz.questions.length;
  const correctCount = answers.filter((a) => a.correct).length;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  container.innerHTML = `
    <section class="page page--quiz">
      <header class="quiz-header">
        <div class="quiz-title">${quiz.title || "Квиз"}</div>
        <div class="quiz-progress">Результат</div>
      </header>
      <article class="quiz-card">
        <p class="quiz-score-main">Верных ответов: <strong>${correctCount} из ${total}</strong> (${scorePercent}%)</p>
        <p class="quiz-score-hint">
          ${
            scorePercent >= 80
              ? "Отлично! Можно идти дальше или помогать другим."
              : scorePercent >= 50
              ? "Неплохо — но есть, что повторить."
              : "Хороший повод ещё раз пройтись по материалам и попробовать снова."
          }
        </p>
        <div class="quiz-actions">
          <button type="button" class="btn" data-quiz-restart>Пройти ещё раз</button>
          <button type="button" class="btn btn-ghost" data-quiz-back>Вернуться в раздел</button>
        </div>
      </article>
    </section>
  `;

  const restartBtn = container.querySelector("[data-quiz-restart]");
  const backBtn = container.querySelector("[data-quiz-back]");

  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      const newState = createInitialState(quiz);
      renderQuestion(container, newState, options);
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (typeof options.onClose === "function") {
        options.onClose();
      }
    });
  }
}

export const QuizEngine = {
  async run(quizData, container, options = {}) {
    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
      container.innerHTML = `
        <section class="page page--quiz">
          <h1>${quizData?.title || "Квиз"}</h1>
          <p>Для этого квиза пока нет вопросов.</p>
        </section>
      `;
      return;
    }

    const state = createInitialState(quizData);
    renderQuestion(container, state, options);
  }
};
