// L2 salary calculator logic, SPA-friendly

import { NDFL_RATE, formatMoney, parseNumber } from "/sm/js/calculators/core.js";

function updatePriceForTerminals(n) {
  const num = Number.isFinite(n) ? n : 0;
  if (num <= 0) return 0;
  if (num === 1) return 1000;
  if (num === 2) return 1500;
  if (num === 3) return 2250;
  if (num === 4) return 2400;
  if (num === 5) return 3000;
  if (num === 6) return 3600;
  if (num === 7) return 4200;
  if (num === 8) return 4800;
  if (num === 9) return 5400;
  if (num >= 10 && num < 50) return 500 * num;
  return 400 * num;
}

export function calculateL2({
  grade,
  cityType,
  resolved,
  onsite,
  overdue,
  teamPlan,
  teamFact,
  secondShiftsIncome,
  summerSetup,
  transfer,
  updatesIncome
}) {
  const g = Number.isFinite(grade) && grade >= 1 && grade <= 4 ? grade : 1;
  const city = cityType || "base";

  const safeResolved = Math.max(0, resolved || 0);
  const safeOnsite = Math.max(0, onsite || 0);
  const safeOverdue = Math.max(0, overdue || 0);
  const safeTeamPlan = Math.max(0, teamPlan || 0);
  const safeTeamFact = Math.max(0, teamFact || 0);
  const safeSecondShiftsIncome = Math.max(0, secondShiftsIncome || 0);
  const safeSummerSetup = Math.max(0, summerSetup || 0);
  const safeTransfer = Math.max(0, transfer || 0);
  const safeUpdatesIncome = Math.max(0, updatesIncome || 0);

  const baseOklads = [32000, 38000, 40000, 49000];
  const plans = [190, 220, 240, 240];
  const rateBaseArr = [52, 56, 60, 64];

  let baseSalary = baseOklads[g - 1] || 0;
  if (city === "plus30") {
    baseSalary = Math.round((baseSalary * 1.3) / 1000) * 1000;
  }

  const plan = plans[g - 1] || 1;
  const rateBase = rateBaseArr[g - 1] || 0;
  const totalTicketsForPlan = safeResolved + safeOnsite;
  const ratio = plan > 0 ? totalTicketsForPlan / plan : 0;

  let coef = 0;
  if (ratio >= 1) coef = 1;
  else if (ratio >= 0.9) coef = 0.9;
  else if (ratio >= 0.8) coef = 0.8;
  else if (ratio >= 0.7) coef = 0.7;

  let overdueBonusRate = 0;
  if (g === 4) {
    if (safeOverdue < 4) overdueBonusRate = 10;
    else if (safeOverdue >= 4 && safeOverdue < 5) overdueBonusRate = 7;
    else if (safeOverdue >= 5 && safeOverdue < 6) overdueBonusRate = 5;
  } else {
    if (safeOverdue < 4) overdueBonusRate = 7;
    else if (safeOverdue >= 4 && safeOverdue < 5) overdueBonusRate = 5;
    else if (safeOverdue >= 5 && safeOverdue < 6) overdueBonusRate = 3;
  }

  let teamBonusRate = 0;
  if (safeTeamPlan > 0) {
    const delta = safeTeamFact - safeTeamPlan;
    if (delta >= 0 && delta <= 100) teamBonusRate = g === 4 ? 5 : 3;
    else if (delta > 100 && delta <= 199) teamBonusRate = g === 4 ? 7 : 5;
    else if (delta >= 200) teamBonusRate = g === 4 ? 10 : 7;
  }

  const perTicketAfterPlan = rateBase * coef;
  const effRate = perTicketAfterPlan + overdueBonusRate + teamBonusRate;
  const ticketsIncome = totalTicketsForPlan * effRate;

  const onsiteGsmBonus = safeOnsite * 100;
  const summerIncome = safeSummerSetup * 300;
  const transferIncome = safeTransfer * 500;

  const bonuses =
    ticketsIncome +
    safeUpdatesIncome +
    safeSecondShiftsIncome +
    onsiteGsmBonus +
    summerIncome +
    transferIncome;

  const totalGross = baseSalary + bonuses;
  const ndfl = baseSalary * NDFL_RATE;
  const totalNet = totalGross - ndfl;

  return {
    grade: g,
    baseSalary,
    rateBase,
    coef,
    overdueBonusRate,
    teamBonusRate,
    effRate,
    ticketsIncome,
    onsiteGsmBonus,
    summerIncome,
    transferIncome,
    updatesIncome: safeUpdatesIncome,
    secondShiftsIncome: safeSecondShiftsIncome,
    bonuses,
    totalGross,
    ndfl,
    totalNet
  };
}


export function initL2Calculator(rootEl) {
  if (!rootEl) return;
  const card = rootEl.querySelector("[data-calc-l2]");
  if (!card) return;

  const els = {
    grade: card.querySelector("#l2-grade"),
    city: card.querySelector("#l2-city"),
    resolved: card.querySelector("#l2-resolved"),
    onsite: card.querySelector("#l2-onsite"),
    overdue: card.querySelector("#l2-overdue"),
    teamPlan: card.querySelector("#l2-team-plan"),
    teamFact: card.querySelector("#l2-team-fact"),
    secondShifts: card.querySelector("#l2-second-shifts"),
    summerSetup: card.querySelector("#l2-summer-setup"),
    transfer: card.querySelector("#l2-transfer")
  };

  const outputs = {
    result: card.querySelector('[data-output="l2-result"]'),
    breakdown: card.querySelector('[data-output="l2-breakdown"]'),
    updatesTotal: card.querySelector('[data-output="updates-total"]'),
    totalGross: card.querySelector('[data-output="l2-total-gross"]'),
    totalNet: card.querySelector('[data-output="l2-total-net"]'),
    bonusTotal: card.querySelector('[data-output="l2-bonus-total"]')
  };

  const updatesTableBody = card.querySelector("[data-updates-table] tbody");
  const addRowBtn = card.querySelector('[data-action="add-update-row"]');
  let rowId = 0;

  const readNumber = (el, fallback = 0) => {
    if (!el) return fallback;
    const v = Number(el.value.replace?.(",", ".") ?? el.value ?? fallback);
    if (!Number.isFinite(v)) return fallback;
    return v;
  };

  const recalcUpdates = () => {
    if (!updatesTableBody) return 0;
    const rows = Array.from(updatesTableBody.querySelectorAll("tr"));
    let totalIncome = 0;

    rows.forEach((row) => {
      const input = row.querySelector("input");
      const terminals = Math.max(0, readNumber(input, 0));
      const price = updatePriceForTerminals(terminals);
      const income = terminals > 0 ? Math.max(price * 0.3, 500) : 0;

      const priceCell = row.querySelector(".upd-price");
      const incomeCell = row.querySelector(".upd-income");
      if (priceCell) priceCell.textContent = `${formatMoney(price)} ₽`;
      if (incomeCell) incomeCell.textContent = `${formatMoney(income)} ₽`;

      totalIncome += income;
    });

    if (outputs.updatesTotal) {
      outputs.updatesTotal.textContent = `Доход от обновлений: ${formatMoney(totalIncome)} ₽`;
    }

    return totalIncome;
  };

  const recalc = () => {
    const updatesIncome = recalcUpdates();

    const payload = {
      grade: readNumber(els.grade, 1),
      cityType: els.city?.value || "base",
      resolved: Math.max(0, readNumber(els.resolved, 0)),
      onsite: Math.max(0, readNumber(els.onsite, 0)),
      overdue: Math.max(0, readNumber(els.overdue, 0)),
      teamPlan: Math.max(0, readNumber(els.teamPlan, 0)),
      teamFact: Math.max(0, readNumber(els.teamFact, 0)),
      secondShiftsIncome: Math.max(0, readNumber(els.secondShifts, 0)),
      summerSetup: Math.max(0, readNumber(els.summerSetup, 0)),
      transfer: Math.max(0, readNumber(els.transfer, 0)),
      updatesIncome
    };

    const r = calculateL2(payload);

    if (outputs.totalGross) {
      outputs.totalGross.textContent = `${formatMoney(r.totalGross)} ₽`;
    }
    if (outputs.totalNet) {
      outputs.totalNet.textContent = `${formatMoney(r.totalNet)} ₽`;
    }
    if (outputs.bonusTotal) {
      outputs.bonusTotal.textContent = `${formatMoney(r.bonuses)} ₽`;
    }

    if (outputs.result) {
      outputs.result.textContent =
        `ЗП L2: ${formatMoney(r.totalGross)} ₽ до вычета, ` +
        `${formatMoney(r.totalNet)} ₽ после вычета (НДФЛ ${formatMoney(r.ndfl)} ₽ с оклада)`;
    }

    if (outputs.breakdown) {
      outputs.breakdown.innerHTML =
        `<div class="rate-line"><span class="rate-label">Оклад (с учётом города): </span>${formatMoney(r.baseSalary)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Базовая ставка грейда: </span>${r.rateBase.toFixed(2)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Коэффициент выполнения плана: </span>${r.coef.toFixed(2)}</div>` +
        `<div class="rate-line"><span class="rate-label">Бонус за низкие просрочки: </span>${r.overdueBonusRate.toFixed(2)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Командный бонус: </span>${r.teamBonusRate.toFixed(2)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Итого ставка за тикет: </span><strong>${r.effRate.toFixed(2)} ₽</strong></div>` +
        `<div class="rate-line"><span class="rate-label">Доход за тикеты (план+выезды): </span>${formatMoney(r.ticketsIncome)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Доход от ночных обновлений: </span>${formatMoney(r.updatesIncome)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Доп. доход за вторые смены: </span>${formatMoney(r.secondShiftsIncome)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">ГСМ за выезды: </span>${formatMoney(r.onsiteGsmBonus)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Летник / ЧЗ: </span>${formatMoney(r.summerIncome)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Перенос в клад: </span>${formatMoney(r.transferIncome)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Сумма премий: </span><strong>${formatMoney(r.bonuses)} ₽</strong></div>`;
    }
  };

  const addRow = () => {
    if (!updatesTableBody) return;
    rowId += 1;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${rowId}</td>
      <td><input type="number" min="0" value="1" inputmode="numeric" /></td>
      <td class="upd-price">0 ₽</td>
      <td class="upd-income">0 ₽</td>
      <td><button type="button" class="btn btn-ghost" data-action="remove-update-row">×</button></td>
    `;
    updatesTableBody.appendChild(tr);

    const input = tr.querySelector("input");
    const removeBtn = tr.querySelector('[data-action="remove-update-row"]');
    if (input) {
      input.addEventListener("input", recalc);
      input.addEventListener("change", recalc);
    }
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        tr.remove();
        recalc();
      });
    }

    recalc();
  };

  if (addRowBtn) {
    addRowBtn.addEventListener("click", () => {
      addRow();
    });
  }

  // начальное состояние: одна строка обновления
  addRow();

  Object.values(els).forEach((el) => {
    if (!el) return;
    el.addEventListener("input", recalc);
    el.addEventListener("change", recalc);
  });

  const triggerBtn = card.querySelector('[data-action="recalc-l2"]');
  if (triggerBtn) triggerBtn.addEventListener("click", recalc);

  recalc();
}
