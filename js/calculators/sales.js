
const NDFL_RATE = 0.13;

/**
 * Универсальная функция форматирования денег в ₽.
 */
function formatMoney(v) {
  if (!Number.isFinite(v)) return "0 ₽";
  return Math.round(v).toLocaleString("ru-RU") + " ₽";
}

/**
 * Хантер: расчёт ЗП по общей формуле.
 *
 * Формула премий (по приказу, обобщённо):
 *   Премия_маржа   = Маржа × % с маржи × ЛК × КК × КСБ
 *   Премия_клауд   = Клауд × 40% × % с клауда × ЛК × КК × КСБ
 *   Премии_доп     = LOYA + RestoPNL + ДСО + прочие фикс.
 *   Оклад_нетто    = Оклад − НДФЛ(13% только с оклада)
 *   Итого_нетто    = Оклад_нетто + Премия_маржа + Премия_клауд + Премии_доп
 */
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

  const mainOut = card.querySelector('[data-output="sales-h-main"]');
  const detailsOut = card.querySelector('[data-output="sales-h-details"]');

  const num = (el, fallback = 0) => {
    if (!el) return fallback;
    const raw = String(el.value || "").replace(",", ".").trim();
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  };

  function recalc() {
    const salary = num(salaryEl, 0);
    const margin = num(marginEl, 0);
    const marginPct = num(marginPctEl, 0) / 100;
    const cloud = num(cloudEl, 0);
    const cloudPct = num(cloudPctEl, 0) / 100;
    const lk = num(lkEl, 1);
    const kk = num(kkEl, 1);
    const ksb = num(ksbEl, 1);
    const bonusLoya = num(bonusLoyaEl, 0);
    const bonusResto = num(bonusRestoEl, 0);
    const bonusOther = num(bonusOtherEl, 0);

    const salaryNdfl = salary * NDFL_RATE;
    const salaryNet = salary - salaryNdfl;

    const coef = lk * kk * ksb;

    const premiumMargin = margin * marginPct * coef;
    const premiumCloud = cloud * 0.40 * cloudPct * coef;
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
        `<div class="rate-line"><span class="rate-label">Маржа:</span> ${formatMoney(margin)} × ${ (marginPct * 100).toFixed(1) }% × ЛК ${lk.toFixed(2)} × КК ${kk.toFixed(2)} × КСБ ${ksb.toFixed(2)}</div>` +
        `<div class="rate-line"><span class="rate-label">Премия с маржи:</span> ${formatMoney(premiumMargin)}</div>` +
        `<div class="rate-line"><span class="rate-label">Клауд-доход:</span> ${formatMoney(cloud)} × 40% × ${ (cloudPct * 100).toFixed(1) }% × ЛК ${lk.toFixed(2)} × КК ${kk.toFixed(2)} × КСБ ${ksb.toFixed(2)}</div>` +
        `<div class="rate-line"><span class="rate-label">Премия с клауда:</span> ${formatMoney(premiumCloud)}</div>` +
        `<div class="rate-line"><span class="rate-label">Доп. премии (LOYA, RestoPNL, ДСО, прочее):</span> ${formatMoney(premiumExtra)}</div>` +
        `<div class="rate-line"><span class="rate-label">Всего премий:</span> ${formatMoney(totalPremium)}</div>` +
        `<div class="rate-line"><span class="rate-label">Итого начислено (брутто):</span> ${formatMoney(totalGross)}</div>` +
        `<div class="rate-line"><span class="rate-label">Итого к выплате «на руки»:</span> <strong>${formatMoney(totalNet)}</strong></div>`;
    }
  }

  ["input", "change"].forEach((evt) => {
    [
      salaryEl, marginEl, marginPctEl,
      cloudEl, cloudPctEl,
      lkEl, kkEl, ksbEl,
      bonusLoyaEl, bonusRestoEl, bonusOtherEl
    ].forEach((el) => el && el.addEventListener(evt, recalc));
  });

  recalc();
}

/**
 * Клиентский отдел: расчёт ЗП по аналогичной формуле,
 * но с отдельными полями (на будущее — можно будет развести проценты).
 */
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

  const mainOut = card.querySelector('[data-output="sales-c-main"]');
  const detailsOut = card.querySelector('[data-output="sales-c-details"]');

  const num = (el, fallback = 0) => {
    if (!el) return fallback;
    const raw = String(el.value || "").replace(",", ".").trim();
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  };

  function recalc() {
    const salary = num(salaryEl, 0);
    const margin = num(marginEl, 0);
    const marginPct = num(marginPctEl, 0) / 100;
    const cloud = num(cloudEl, 0);
    const cloudPct = num(cloudPctEl, 0) / 100;
    const lk = num(lkEl, 1);
    const kk = num(kkEl, 1);
    const ksb = num(ksbEl, 1);
    const bonusLoya = num(bonusLoyaEl, 0);
    const bonusResto = num(bonusRestoEl, 0);
    const bonusOther = num(bonusOtherEl, 0);

    const salaryNdfl = salary * NDFL_RATE;
    const salaryNet = salary - salaryNdfl;

    const coef = lk * kk * ksb;

    const premiumMargin = margin * marginPct * coef;
    const premiumCloud = cloud * 0.40 * cloudPct * coef;
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
        `<div class="rate-line"><span class="rate-label">Маржа:</span> ${formatMoney(margin)} × ${ (marginPct * 100).toFixed(1) }% × ЛК ${lk.toFixed(2)} × КК ${kk.toFixed(2)} × КСБ ${ksb.toFixed(2)}</div>` +
        `<div class="rate-line"><span class="rate-label">Премия с маржи:</span> ${formatMoney(premiumMargin)}</div>` +
        `<div class="rate-line"><span class="rate-label">Клауд-доход:</span> ${formatMoney(cloud)} × 40% × ${ (cloudPct * 100).toFixed(1) }% × ЛК ${lk.toFixed(2)} × КК ${kk.toFixed(2)} × КСБ ${ksb.toFixed(2)}</div>` +
        `<div class="rate-line"><span class="rate-label">Премия с клауда:</span> ${formatMoney(premiumCloud)}</div>` +
        `<div class="rate-line"><span class="rate-label">Доп. премии (LOYA, RestoPNL, ДСО, прочее):</span> ${formatMoney(premiumExtra)}</div>` +
        `<div class="rate-line"><span class="rate-label">Всего премий:</span> ${formatMoney(totalPremium)}</div>` +
        `<div class="rate-line"><span class="rate-label">Итого начислено (брутто):</span> ${formatMoney(totalGross)}</div>` +
        `<div class="rate-line"><span class="rate-label">Итого к выплате «на руки»:</span> <strong>${formatMoney(totalNet)}</strong></div>`;
    }
  }

  ["input", "change"].forEach((evt) => {
    [
      salaryEl, marginEl, marginPctEl,
      cloudEl, cloudPctEl,
      lkEl, kkEl, ksbEl,
      bonusLoyaEl, bonusRestoEl, bonusOtherEl
    ].forEach((el) => el && el.addEventListener(evt, recalc));
  });

  recalc();
}
