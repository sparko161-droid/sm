const NDFL_RATE = 0.13;

const LEVELS = {
  "1i": { label: "1 уровень (испытательный)", plan: 80, rate: 100 },
  "1": { label: "1 уровень", plan: 100, rate: 100 },
  "2": { label: "2 уровень", plan: 120, rate: 140 },
  "3": { label: "3 уровень", plan: 150, rate: 170 },
  "4": { label: "4 уровень", plan: 180, rate: 200 }
};

function calcPersonalCoef(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) return 0;
  const percent = ratio * 100;
  if (percent <= 85) return 0.9;
  if (percent <= 90) return 0.925;
  if (percent <= 95) return 0.95;
  if (percent <= 99) return 0.975;
  return 1.0;
}

function calcTeamCoef(teamHours) {
  const h = Number.isFinite(teamHours) ? teamHours : 0;
  if (h >= 650) return 1.2;
  if (h >= 550) return 1.1;
  if (h >= 450) return 1.0;
  return 1.0;
}

function formatMoney(v) {
  return Math.round(v).toLocaleString("ru-RU");
}

export function initImplementationCalculator(rootEl) {
  if (!rootEl) return;
  const card = rootEl.querySelector("[data-calc-impl]");
  if (!card) return;

  const gradeEl = card.querySelector("#impl-grade");
  const hoursEl = card.querySelector("#impl-hours");
  const teamHoursEl = card.querySelector("#impl-team-hours");

  const mainOut = card.querySelector('[data-output="impl-main"]');
  const detailsOut = card.querySelector('[data-output="impl-details"]');

  const readNumber = (el, fallback = 0) => {
    if (!el) return fallback;
    const raw = (el.value ?? "").toString().replace(",", ".");
    const num = Number(raw);
    return Number.isFinite(num) ? num : fallback;
  };

  function recalc() {
    const levelKey = gradeEl?.value || "1";
    const level = LEVELS[levelKey] || LEVELS["1"];
    const factHours = readNumber(hoursEl, 0);
    const teamHours = readNumber(teamHoursEl, 0);

    const plan = level.plan;
    const rate = level.rate;

    const ratio = plan > 0 ? factHours / plan : 0;
    const personalCoef = calcPersonalCoef(ratio);
    const teamCoef = calcTeamCoef(teamHours);

    const baseAmount = factHours * rate;
    const gross = baseAmount * personalCoef * teamCoef;
    const ndfl = gross * NDFL_RATE;
    const net = gross - ndfl;

    if (mainOut) {
      if (!factHours || factHours <= 0) {
        mainOut.textContent = "Укажите фактически отработанные норма-часы, чтобы рассчитать пример.";
      } else {
        mainOut.textContent =
          `Примерная ЗП: ${formatMoney(gross)} ₽ до вычета НДФЛ и ${formatMoney(net)} ₽ «на руки».`;
      }
    }

    if (detailsOut) {
      const percent = plan > 0 ? (ratio * 100).toFixed(1) : "0.0";
      detailsOut.innerHTML =
        `<div class="rate-line"><span class="rate-label">Уровень:</span> ${level.label}, план ${plan} нч, ставка ${rate} ₽/ч</div>` +
        `<div class="rate-line"><span class="rate-label">Факт нч:</span> ${factHours} нч (${percent}% плана)</div>` +
        `<div class="rate-line"><span class="rate-label">Личный коэффициент:</span> × ${personalCoef.toFixed(3)}</div>` +
        `<div class="rate-line"><span class="rate-label">Командный коэффициент:</span> × ${teamCoef.toFixed(2)}</div>` +
        `<div class="rate-line"><span class="rate-label">База (нч × ставка):</span> ${formatMoney(baseAmount)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">НДФЛ 13%:</span> -${formatMoney(ndfl)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Итого «на руки»:</span> <strong>${formatMoney(net)} ₽</strong></div>`;
    }
  }

  ["change", "input"].forEach(evt => {
    gradeEl?.addEventListener(evt, recalc);
    hoursEl?.addEventListener(evt, recalc);
    teamHoursEl?.addEventListener(evt, recalc);
  });

  recalc();
}
