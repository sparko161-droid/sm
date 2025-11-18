window.SupportOnboardingPage = {
  init(containerElement) {
    if (!containerElement) return;

    if (window.SupportAccordions) {
      window.SupportAccordions.init(containerElement);
    }

    if (window.QuizInit) {
      window.QuizInit.initForSection(containerElement, 'support-onboarding');
    }

    if (window.ProbationTable) {
      window.ProbationTable.init(containerElement);
    }
  }
};
