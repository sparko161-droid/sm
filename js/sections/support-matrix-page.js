window.SupportMatrixPage = {
  init(containerElement) {
    if (!containerElement) return;

    if (window.SupportFilters) {
      window.SupportFilters.init(containerElement);
    }

    if (window.SupportAccordions) {
      window.SupportAccordions.init(containerElement);
    }

    if (window.QuizInit) {
      window.QuizInit.initForSection(containerElement, 'support-matrix');
    }
  }
};
