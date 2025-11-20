// Простое глобальное состояние. При необходимости расширим.

export const AppState = {
  quizzes: {},      // кэш загруженных квизов
  results: [],      // история прохождений

  // content/*, загружаемые через GitHub backend
  sections: null,   // данные из content/sections.json
  filters: null,    // данные из content/filters.json
  calculators: null,// данные из content/calculators.json
  pages: {}         // кэш загруженных страниц (pagePath -> JSON)
};
