window.SupportPage = {
  init(containerElement) {
    if (window.SupportFilters) {
      window.SupportFilters.init(containerElement);
    }
    if (window.SupportAccordions) {
      window.SupportAccordions.init(containerElement);
    }
    if (window.SupportQuizzes) {
      window.SupportQuizzes.init(containerElement);
    }
    if (window.L1Calculator) {
      window.L1Calculator.init(containerElement);
    }
    if (window.L2Calculator) {
      window.L2Calculator.init(containerElement);
    }
  }
};
