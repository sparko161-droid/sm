window.SupportPage = {
  init(containerElement) {
    if (window.SupportFilters) {
      window.SupportFilters.init(containerElement);
    }
    if (window.SupportAccordions) {
      window.SupportAccordions.init(containerElement);
    }
    if (window.SupportTemplates) {
      window.SupportTemplates.init(containerElement);
    }
    if (window.QuizInit) {
      window.QuizInit.initForSection(containerElement, 'support');
    }
    if (window.L1Calculator) {
      window.L1Calculator.init(containerElement);
    }
    if (window.L2Calculator) {
      window.L2Calculator.init(containerElement);
    }
    if (window.SupportProbation) {
      window.SupportProbation.init(containerElement);
    }
  }
};
