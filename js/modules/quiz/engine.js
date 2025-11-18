// Здесь позже будет реальный движок квизов

export const QuizEngine = {
  async run(quizData, container) {
    container.innerHTML = `
      <section class="page page--quiz">
        <h1>${quizData.title || "Квиз"}</h1>
        <p>Базовый skeleton интерфейса квиза. Реализуем позже.</p>
      </section>
    `;
  }
};
