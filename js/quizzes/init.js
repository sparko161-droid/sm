window.QuizInit = {
  initForSection(containerElement, sectionName) {
    if (window.QuizEngine) {
      window.QuizEngine.init(containerElement, sectionName);
    }
  }
};
