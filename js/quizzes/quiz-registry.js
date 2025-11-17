(function() {
  const banks = {};

  window.QuizRegistry = {
    registerBank(sectionName, bankObject) {
      banks[sectionName] = bankObject || {};
    },
    getBank(sectionName) {
      return banks[sectionName] || {};
    },
    getQuiz(sectionName, quizId) {
      const bank = banks[sectionName] || {};
      return bank[quizId] || null;
    }
  };
})();
