window.SupportQuizzes = {
  init(containerElement) {
    if (window.QuizEngine && window.SupportQuizBank) {
      window.QuizEngine.init(containerElement, window.SupportQuizBank);
    }
  }
};
