import ProbationTable from "/sm/js/modules/support/probation-table.js";
import SupportAccordions from "/sm/js/modules/support/support-accordions.js";
import SupportFilters from "/sm/js/modules/support/support-filters.js";
import SupportProbation from "/sm/js/modules/support/support-probation.js";
import SupportTemplates from "/sm/js/modules/support/support-templates.js";

export function initSupportInteractions(container) {
  if (!container) return;

  // Основные фильтры по линиям
  try {
    SupportFilters.init(container);
  } catch (e) {
    console.warn("[Support] filters init failed", e);
  }

  // Аккордеоны (FAQ, подробности и т.п.)
  try {
    SupportAccordions.init(container);
  } catch (e) {
    console.warn("[Support] accordions init failed", e);
  }

  // Пробационный калькулятор с сохранением в localStorage
  try {
    ProbationTable.init(container);
  } catch (e) {
    console.warn("[Support] probation table init failed", e);
  }

  // Lightweight калькулятор статуса без сохранения
  try {
    SupportProbation.init(container);
  } catch (e) {
    console.warn("[Support] probation lightweight init failed", e);
  }

  // Шаблоны и копирование в буфер
  try {
    SupportTemplates.init(container);
  } catch (e) {
    console.warn("[Support] templates init failed", e);
  }
}
