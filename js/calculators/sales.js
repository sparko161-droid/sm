import { NDFL_RATE, formatMoney, parseNumber, attachAutoRecalc } from "/sm/js/calculators/core.js";


function _legacyFormatMoney(v) {
  if (!Number.isFinite(v)) return "0 ₽";
  return Math.round(v).toLocaleString("ru-RU") + " ₽";
}

function _legacyParseNumber(el, fallback = 0) {
  if (!el) return fallback;
  const raw = String(el.value || "").replace(",", ".").trim();
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function initSalesHunterCalculator(root) {
  if (!root) return;
  const card = root.querySelector("[data-calc-sales-hunter]");
  if (!card) return;

  const salaryEl = card.querySelector("#sales-h-salary");
  const marginEl = card.querySelector("#sales-h-margin");
  const marginPctEl = card.querySelector("#sales-h-margin-pct");
  const cloudEl = card.querySelector("#sales-h-cloud");
  const cloudPctEl = card.querySelector("#sales-h-cloud-pct");
  const lkEl = card.querySelector("#sales-h-lk");
  const kkEl = card.querySelector("#sales-h-kk");
  const ksbEl = card.querySelector("#sales-h-ksb");
  const bonusLoyaEl = card.querySelector("#sales-h-loya");
  const bonusRestoEl = card.querySelector("#sales-h-resto");
  const bonusOtherEl = card.querySelector("#sales-h-other");

  const mainOut = card.querySelector('[data-output=\"sales-h-main\"]');
  const detailsOut = card.querySelector('[data-output=\"sales-h-details\"]');

  function recalc() {
    const salary = parseNumber(salaryEl, 0);
    const margin = parseNumber(marginEl, 0);
    const marginPct = parseNumber(marginPctEl, 0) / 100;
    const cloud = parseNumber(cloudEl, 0);
    const cloudPct = parseNumber(cloudPctEl, 0) / 100;
    const lk = parseNumber(lkEl, 1);
    const kk = parseNumber(kkEl, 1);
    const ksb = parseNumber(ksbEl, 1);
    const bonusLoya = parseNumber(bonusLoyaEl, 0);
    const bonusResto = parseNumber(bonusRestoEl, 0);
    const bonusOther = parseNumber(bonusOtherEl, 0);

    const salaryNdfl = salary * NDFL_RATE;
    const salaryNet = salary - salaryNdfl;

    const coef = lk * kk * ksb;

    const premiumMargin = margin * marginPct * coef;
    const premiumCloud = cloud * 0.4 * cloudPct * coef;
    const premiumExtra = bonusLoya + bonusResto + bonusOther;

    const totalPremium = premiumMargin + premiumCloud + premiumExtra;
    const totalGross = salary + totalPremium;
    const totalNet = salaryNet + totalPremium;

    if (mainOut) {
      if (!margin && !cloud && !salary) {
        mainOut.textContent = "Заполните оклад, маржу и/или клауд, чтобы увидеть расчёт.";
      } else {
        mainOut.textContent = `Итого к выплате «на руки»: ${formatMoney(totalNet)} (оклад после НДФЛ + все премии).`;
      }
    }

    if (detailsOut) {
      detailsOut.innerHTML =
        `<div class="rate-line"><span class="rate-label">Оклад (брутто):</span> ${formatMoney(salary)}</div>` +
        `<div class="rate-line"><span class="rate-label">НДФЛ 13% с оклада:</span> ${formatMoney(salaryNdfl)}</div>` +
        `<div class="rate-line"><span class="rate-label">Оклад «на руки»:</span> ${formatMoney(salaryNet)}</div>` +
        `<div class="rate-line"><span class="rate-label">Маржа:</span> ${formatMoney(margin)} × ${(marginPct * 100).toFixed(1)}% × ЛК ${lk.toFixed(2)} × КК ${kk.toFixed(2)} × КСБ ${ksb.toFixed(2)}</div>` +
        `<div class="rate-line"><span class="rate-label">Премия с маржи:</span> ${formatMoney(premiumMargin)}</div>` +
        `<div class="rate-line"><span class="rate-label">Клауд-доход:</span> ${formatMoney(cloud)} × 40% × ${(cloudPct * 100).toFixed(1)}% × ЛК ${lk.toFixed(2)} × КК ${kk.toFixed(2)} × КСБ ${ksb.toFixed(2)}</div>` +
        `<div class="rate-line"><span class="rate-label">Премия с клауда:</span> ${formatMoney(premiumCloud)}</div>` +
        `<div class="rate-line"><span class="rate-label">Доп. премии (LOYA, RestoPNL, ДСО, прочее):</span> ${formatMoney(premiumExtra)}</div>` +
        `<div class="rate-line"><span class="rate-label">Всего премий:</span> ${formatMoney(totalPremium)}</div>` +
        `<div class="rate-line"><span class="rate-label">Итого начислено (брутто):</span> ${formatMoney(totalGross)}</div>` +
        `<div class="rate-line"><span class="rate-label">Итого к выплате «на руки»:</span> <strong>${formatMoney(totalNet)}</strong></div>`;
    }
  }

  ["input", "change"].forEach((evt) => {
    [
      salaryEl,
      marginEl,
      marginPctEl,
      cloudEl,
      cloudPctEl,
      lkEl,
      kkEl,
      ksbEl,
      bonusLoyaEl,
      bonusRestoEl,
      bonusOtherEl,
    ].forEach((el) => el && el.addEventListener(evt, recalc));
  });

  recalc();
}

export function initSalesClientCalculator(root) {
  if (!root) return;
  const card = root.querySelector("[data-calc-sales-client]");
  if (!card) return;

  const salaryEl = card.querySelector("#sales-c-salary");
  const marginEl = card.querySelector("#sales-c-margin");
  const marginPctEl = card.querySelector("#sales-c-margin-pct");
  const cloudEl = card.querySelector("#sales-c-cloud");
  const cloudPctEl = card.querySelector("#sales-c-cloud-pct");
  const lkEl = card.querySelector("#sales-c-lk");
  const kkEl = card.querySelector("#sales-c-kk");
  const ksbEl = card.querySelector("#sales-c-ksb");
  const bonusLoyaEl = card.querySelector("#sales-c-loya");
  const bonusRestoEl = card.querySelector("#sales-c-resto");
  const bonusOtherEl = card.querySelector("#sales-c-other");

  const mainOut = card.querySelector('[data-output=\"sales-c-main\"]');
  const detailsOut = card.querySelector('[data-output=\"sales-c-details\"]');

  function recalc() {
    const salary = parseNumber(salaryEl, 0);
    const margin = parseNumber(marginEl, 0);
    const marginPct = parseNumber(marginPctEl, 0) / 100;
    const cloud = parseNumber(cloudEl, 0);
    const cloudPct = parseNumber(cloudPctEl, 0) / 100;
    const lk = parseNumber(lkEl, 1);
    const kk = parseNumber(kkEl, 1);
    const ksb = parseNumber(ksbEl, 1);
    const bonusLoya = parseNumber(bonusLoyaEl, 0);
    const bonusResto = parseNumber(bonusRestoEl, 0);
    const bonusOther = parseNumber(bonusOtherEl, 0);

    const salaryNdfl = salary * NDFL_RATE;
    const salaryNet = salary - salaryNdfl;

    const coef = lk * kk * ksb;

    const premiumMargin = margin * marginPct * coef;
    const premiumCloud = cloud * 0.4 * cloudPct * coef;
    const premiumExtra = bonusLoya + bonusResto + bonusOther;

    const totalPremium = premiumMargin + premiumCloud + premiumExtra;
    const totalGross = salary + totalPremium;
    const totalNet = salaryNet + totalPremium;

    if (mainOut) {
      if (!margin && !cloud && !salary) {
        mainOut.textContent = "Заполните оклад, маржу и/или клауд, чтобы увидеть расчёт.";
      } else {
        mainOut.textContent = `Итого к выплате «на руки»: ${formatMoney(totalNet)} (оклад после НДФЛ + все премии).`;
      }
    }

    if (detailsOut) {
      detailsOut.innerHTML =
        `<div class="rate-line"><span class="rate-label">Оклад (брутто):</span> ${formatMoney(salary)}</div>` +
        `<div class="rate-line"><span class="rate-label">НДФЛ 13% с оклада:</span> ${formatMoney(salaryNdfl)}</div>` +
        `<div class="rate-line"><span class="rate-label">Оклад «на руки»:</span> ${formatMoney(salaryNet)}</div>` +
        `<div class="rate-line"><span class="rate-label">Маржа:</span> ${formatMoney(margin)} × ${(marginPct * 100).toFixed(1)}% × ЛК ${lk.toFixed(2)} × КК ${kk.toFixed(2)} × КСБ ${ksb.toFixed(2)}</div>` +
        `<div class="rate-line"><span class="rate-label">Премия с маржи:</span> ${formatMoney(premiumMargin)}</div>` +
        `<div class="rate-line"><span class="rate-label">Клауд-доход:</span> ${formatMoney(cloud)} × 40% × ${(cloudPct * 100).toFixed(1)}% × ЛК ${lk.toFixed(2)} × КК ${kk.toFixed(2)} × КСБ ${ksb.toFixed(2)}</div>` +
        `<div class="rate-line"><span class="rate-label">Премия с клауда:</span> ${formatMoney(premiumCloud)}</div>` +
        `<div class="rate-line"><span class="rate-label">Доп. премии (LOYA, RestoPNL, ДСО, прочее):</span> ${formatMoney(premiumExtra)}</div>` +
        `<div class="rate-line"><span class="rate-label">Всего премий:</span> ${formatMoney(totalPremium)}</div>` +
        `<div class="rate-line"><span class="rate-label">Итого начислено (брутто):</span> ${formatMoney(totalGross)}</div>` +
        `<div class="rate-line"><span class="rate-label">Итого к выплате «на руки»:</span> <strong>${formatMoney(totalNet)}</strong></div>`;
    }
  }

  ["input", "change"].forEach((evt) => {
    [
      salaryEl,
      marginEl,
      marginPctEl,
      cloudEl,
      cloudPctEl,
      lkEl,
      kkEl,
      ksbEl,
      bonusLoyaEl,
      bonusRestoEl,
      bonusOtherEl,
    ].forEach((el) => el && el.addEventListener(evt, recalc));
  });

  recalc();
}
