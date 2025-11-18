import SupportFilters from "/sm/js/modules/support/support-filters.js";
import SupportAccordions from "/sm/js/modules/support/support-accordions.js";
import SupportTemplates from "/sm/js/modules/support/support-templates.js";
import SupportProbation from "/sm/js/modules/support/support-probation.js";
import ProbationTable from "/sm/js/modules/support/probation-table.js";
import { initL1Calculator } from "/sm/js/calculators/l1.js";
import { initL2Calculator } from "/sm/js/calculators/l2.js";


export function initSupportInteractions(container) {if (!container) return;

  try {
    SupportFilters.init(container);
  } catch (e) {
    console.warn('[Support] Filters init failed', e);
  }

  try {
    SupportAccordions.init(container);
  } catch (e) {
    console.warn('[Support] Accordions init failed', e);
  }

  try {
    SupportTemplates.init(container);
  } catch (e) {
    console.warn('[Support] Templates init failed', e);
  }

  try {
    ProbationTable.init(container);
  } catch (e) {
    console.warn('[Support] ProbationTable init failed', e);
  }

  try {
    SupportProbation.init(container);
  } catch (e) {
    console.warn('[Support] SupportProbation init failed', e);
  }
  try {
    initL1Calculator(container);
  } catch (e) {
    console.warn('[Support] L1 calculator init failed', e);
  }

  try {
    initL2Calculator(container);
  } catch (e) {
    console.warn('[Support] L2 calculator init failed', e);
  }

}
