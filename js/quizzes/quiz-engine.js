window.QuizEngine = {
  init(containerElement, sectionName) {
    if (!containerElement) return;
    const triggers = Array.from(containerElement.querySelectorAll('[data-quiz]'));
    const backdrop = containerElement.querySelector('[data-quiz-backdrop]');
    if (!triggers.length || !backdrop) return;

    const dialog = backdrop.querySelector('.quiz-dialog');
    const titleEl = backdrop.querySelector('[data-quiz-title]');
    const progressEl = backdrop.querySelector('[data-quiz-progress]');
    const questionEl = backdrop.querySelector('[data-quiz-question]');
    const optionsEl = backdrop.querySelector('[data-quiz-options]');
    const feedbackEl = backdrop.querySelector('[data-quiz-feedback]');
    const nextBtn = backdrop.querySelector('[data-quiz-next]');

    let currentQuiz = null;
    let currentIndex = 0;

    const close = () => {
      backdrop.hidden = true;
      backdrop.classList.remove('open');
      currentQuiz = null;
      currentIndex = 0;
    };

    const renderQuestion = () => {
      if (!currentQuiz) return;
      const question = currentQuiz.questions[currentIndex];
      if (!question) return close();

      if (titleEl) titleEl.textContent = currentQuiz.title;
      if (progressEl) progressEl.textContent = `Вопрос ${currentIndex + 1} из ${currentQuiz.questions.length}`;
      if (questionEl) questionEl.textContent = question.prompt;
      if (feedbackEl) feedbackEl.textContent = '';
      if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.textContent = currentIndex === currentQuiz.questions.length - 1 ? 'Завершить тест' : 'Следующий вопрос →';
      }

      if (optionsEl) {
        optionsEl.innerHTML = '';
        question.options.forEach((option) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'quiz-option';
          btn.textContent = option.text;
          btn.addEventListener('click', () => {
            const buttons = Array.from(optionsEl.querySelectorAll('button'));
            buttons.forEach((b) => {
              b.disabled = true;
              if (b === btn) {
                b.classList.add(option.correct ? 'correct' : 'wrong');
              }
            });
            if (feedbackEl) feedbackEl.textContent = option.note || (option.correct ? 'Верно!' : 'Почти, попробуй иначе.');
            if (nextBtn) nextBtn.disabled = false;
          });
          optionsEl.appendChild(btn);
        });
      }
    };

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (!currentQuiz) return;
        const lastQuestion = currentIndex === currentQuiz.questions.length - 1;
        if (lastQuestion) {
          close();
          return;
        }
        currentIndex += 1;
        renderQuestion();
      });
    }

    const closeBtn = backdrop.querySelector('[data-quiz-close]');
    if (closeBtn) closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });

    triggers.forEach((btn) => {
      btn.addEventListener('click', () => {
        const quizId = btn.getAttribute('data-quiz');
        const section = btn.getAttribute('data-quiz-section') || sectionName;
        const quiz = window.QuizRegistry && window.QuizRegistry.getQuiz(section, quizId);
        if (!quiz) return;
        currentQuiz = quiz;
        currentIndex = 0;
        backdrop.hidden = false;
        backdrop.classList.add('open');
        renderQuestion();
      });
    });
  }
};
