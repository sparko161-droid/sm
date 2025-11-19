// L1 salary calculator logic, SPA-friendly

import { NDFL_RATE, formatMoney } from "/sm/js/calculators/core.js";

export function calculateL1({ grade, resolved, created, missed, overdue }) {
  const safeGrade = Number.isFinite(grade) && grade >= 1 && grade <= 3 ? grade : 1;
  const g = safeGrade;

  const baseSalary = g === 1 ? 23000 : g === 2 ? 29000 : 32000;

  let resBase = 0;
  if (g === 1 || g === 2) {
    if (resolved >= 50 && resolved < 100) resBase = 20;
    else if (resolved >= 100) resBase = 25;
  } else {
    if (resolved >= 100 && resolved <= 115) resBase = 23;
    else if (resolved >= 116 && resolved <= 129) resBase = 26;
    else if (resolved >= 130 && resolved <= 144) resBase = 29;
    else if (resolved >= 145) resBase = 32;
  }

  let resBonus = 0;
  if (g === 3) {
    if (overdue <= 1) resBonus = 3;
    else if (overdue > 1 && overdue <= 1.5) resBonus = 2;
    else if (overdue > 1.5 && overdue <= 2) resBonus = 1;
  }

  const resFinal = resBase + resBonus;
  const resSum = resolved * resFinal;

  let crBase = 0;
  if (created >= 300 && created < 400) crBase = 15;
  else if (created >= 400 && created < 500) crBase = 20;
  else if (created >= 500) crBase = 25;

  let crBonus = 0;
  if (missed <= 1.5) crBonus = 2;
  else if (missed > 1.5 && missed < 2) crBonus = 1;

  const crFinal = crBase + crBonus;
  const crSum = created * crFinal;

  const totalGross = baseSalary + resSum + crSum;
  const ndfl = baseSalary * NDFL_RATE;
  const totalNet = totalGross - ndfl;

  return {
    grade: g,
    baseSalary,
    resBase,
    resBonus,
    resFinal,
    resSum,
    crBase,
    crBonus,
    crFinal,
    crSum,
    totalGross,
    ndfl,
    totalNet
  };
}

function formatMoney(value) {
  return Math.round(value).toLocaleString("ru-RU");
}

export function initL1Calculator(rootEl) {
  if (!rootEl) return;
  const card = rootEl.querySelector("[data-calc-l1]");
  if (!card) return;

  const els = {
    grade: card.querySelector("#l1-grade"),
    resolved: card.querySelector("#l1-resolved"),
    created: card.querySelector("#l1-created"),
    missed: card.querySelector("#l1-missed"),
    overdue: card.querySelector("#l1-overdue")
  };

  const outputs = {
    result: card.querySelector('[data-output="l1-result"]'),
    breakdown: card.querySelector('[data-output="l1-breakdown"]'),
    totalGross: card.querySelector('[data-output="l1-total-gross"]'),
    totalNet: card.querySelector('[data-output="l1-total-net"]')
  };

  const readNumber = (el, fallback = 0) => {
    if (!el) return fallback;
    const v = Number(el.value.replace?.(",", ".") ?? el.value ?? fallback);
    if (!Number.isFinite(v)) return fallback;
    return v;
  };

  const recalc = () => {
    const payload = {
      grade: readNumber(els.grade, 1),
      resolved: Math.max(0, readNumber(els.resolved, 0)),
      created: Math.max(0, readNumber(els.created, 0)),
      missed: Math.max(0, readNumber(els.missed, 0)),
      overdue: Math.max(0, readNumber(els.overdue, 0))
    };

    const r = calculateL1(payload);

    if (outputs.totalGross) {
      outputs.totalGross.textContent = `${formatMoney(r.totalGross)} ₽`;
    }
    if (outputs.totalNet) {
      outputs.totalNet.textContent = `${formatMoney(r.totalNet)} ₽`;
    }

    if (outputs.result) {
      outputs.result.textContent =
        `ЗП L1: ${formatMoney(r.totalGross)} ₽ до вычета, ` +
        `${formatMoney(r.totalNet)} ₽ после вычета (НДФЛ ${formatMoney(r.ndfl)} ₽ с оклада)`;
    }

    if (outputs.breakdown) {
      outputs.breakdown.innerHTML =
        `<div class="rate-line"><span class="rate-label">Оклад: </span>${formatMoney(r.baseSalary)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Ставка закрытия (база): </span>${r.resBase.toFixed(2)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">+ бонус за SLA/просрочки: </span>${r.resBonus.toFixed(2)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Итого ставка за закрытие: </span><strong>${r.resFinal.toFixed(2)} ₽</strong></div>` +
        `<div class="rate-line"><span class="rate-label">Доход за закрытия: </span>${formatMoney(r.resSum)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Ставка создания (база): </span>${r.crBase.toFixed(2)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">+ бонус за пропущенные звонки: </span>${r.crBonus.toFixed(2)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Итого ставка за создание: </span><strong>${r.crFinal.toFixed(2)} ₽</strong></div>` +
        `<div class="rate-line"><span class="rate-label">Доход за создания: </span>${formatMoney(r.crSum)} ₽</div>`;
    }
  };

  Object.values(els).forEach((el) => {
    if (!el) return;
    el.addEventListener("input", recalc);
    el.addEventListener("change", recalc);
  });

  const triggerBtn = card.querySelector('[data-action="recalc-l1"]');
  if (triggerBtn) triggerBtn.addEventListener("click", recalc);

  recalc();
}
