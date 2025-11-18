import { delay } from "/sm/js/core/utils.js";

function createInitialState(quiz) {
  return {
    currentIndex: 0,
    completed: false,
    answers: [], // { questionIndex, optionIndex, correct }
    quiz
  };
}

function renderQuestion(container, state) {
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
        <button type="button" class="btn" data-quiz-next disabled>Ответить</button>
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

  let selectedIndex = null;
  let locked = false;

  optionsRoot.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const btn = target.closest(".quiz-option");
    if (!btn || locked) return;
    const idxStr = btn.dataset.index;
    if (idxStr == null) return;

    selectedIndex = Number(idxStr);

    optionsRoot.querySelectorAll(".quiz-option").forEach((el) => {
      el.classList.remove("quiz-option--selected");
    });
    btn.classList.add("quiz-option--selected");

    if (nextBtn) nextBtn.disabled = false;
    feedbackEl.textContent = "";
  });

  if (nextBtn) {
    nextBtn.addEventListener("click", async () => {
      if (selectedIndex == null || locked) return;
      locked = true;

      const opt = question.options[selectedIndex];
      const correct = !!opt.correct;

      state.answers.push({
        questionIndex: currentIndex,
        optionIndex: selectedIndex,
        correct
      });

      optionsRoot.querySelectorAll(".quiz-option").forEach((el, idx) => {
        el.classList.remove("quiz-option--selected");
        el.classList.remove("quiz-option--correct");
        el.classList.remove("quiz-option--wrong");

        const optionData = question.options[idx];
        if (optionData.correct) {
          el.classList.add("quiz-option--correct");
        }
        if (idx === selectedIndex && !optionData.correct) {
          el.classList.add("quiz-option--wrong");
        }
      });

      let feedbackHtml = "";
      if (opt.note) {
        feedbackHtml = opt.note;
      } else if (correct) {
        feedbackHtml = "✅ Верно!";
      } else {
        feedbackHtml = "❌ Не совсем так. Посмотри пояснение.";
      }
      feedbackEl.innerHTML = feedbackHtml;

      nextBtn.disabled = true;

      await delay(600);

      const nextIndex = currentIndex + 1;
      if (nextIndex < total) {
        state.currentIndex = nextIndex;
        renderQuestion(container, state);
      } else {
        state.completed = true;
        renderSummary(container, state);
      }
    });
  }
}

function renderSummary(container, state) {
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
          ${scorePercent >= 80 ? "Отлично! Можно идти дальше или помогать другим." :
            scorePercent >= 50 ? "Неплохо — но есть, что повторить." :
            "Хороший повод ещё раз пройтись по материалам и попробовать снова."}
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
      renderQuestion(container, newState);
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }
}

export const QuizEngine = {
  async run(quizData, container) {
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
    renderQuestion(container, state);
  }
};
