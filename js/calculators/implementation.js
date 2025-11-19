const NDFL_RATE = 0.13;

const LEVELS = {
  "1i": {
    key: "1i",
    label: "1 уровень (испытательный)",
    title: "Специалист 1-го уровня (исп. срок)",
    plan: 80,
    rate: 100,
    salary: 30000
  },
  "1": {
    key: "1",
    label: "1 уровень",
    title: "Специалист 1-го уровня",
    plan: 100,
    rate: 100,
    salary: 30000
  },
  "2": {
    key: "2",
    label: "2 уровень",
    title: "Специалист 2-го уровня",
    plan: 120,
    rate: 140,
    salary: 35000
  },
  "3": {
    key: "3",
    label: "3 уровень",
    title: "Специалист 3-го уровня",
    plan: 150,
    rate: 170,
    salary: 38000
  },
  "4": {
    key: "4",
    label: "4 уровень",
    title: "Специалист 4-го уровня",
    plan: 180,
    rate: 200,
    salary: 43000
  }
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

function formatMoneySigned(v) {
  const abs = Math.round(Math.abs(v)).toLocaleString("ru-RU");
  if (v > 0) return "+ " + abs + " ₽";
  if (v < 0) return "− " + abs + " ₽";
  return "0 ₽";
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
    const salary = level.salary;

    const ratio = plan > 0 ? factHours / plan : 0;
    const personalCoef = calcPersonalCoef(ratio);
    const teamCoef = calcTeamCoef(teamHours);

    const basePay = factHours * rate; // оплата за факт нч без коэффициентов
    const personalBonus = basePay * (personalCoef - 1);
    const personalBase = basePay * personalCoef;
    const teamBonus = personalBase * (teamCoef - 1);
    const totalBonus = personalBonus + teamBonus;

    // Оклад и НДФЛ
    const salaryNdfl = salary * NDFL_RATE;
    const salaryNet = salary - salaryNdfl;

    const grossTotal = salary + basePay + totalBonus;
    const netTotal = salaryNet + basePay + totalBonus;

    if (mainOut) {
      if (!factHours || factHours <= 0) {
        mainOut.textContent =
          "Укажите фактически отработанные норма-часы и нч отдела, чтобы рассчитать пример зарплаты.";
      } else {
        mainOut.textContent =
          `Итого к выплате «на руки»: ${formatMoney(netTotal)} ₽ (включая оклад после НДФЛ и все премии).`;
      }
    }

    if (detailsOut) {
      const percent = plan > 0 ? (ratio * 100).toFixed(1) : "0.0";

      const html =
        `<div class="rate-line"><span class="rate-label">Роль и уровень:</span> ${level.title} · ${level.label}</div>` +
        `<div class="rate-line"><span class="rate-label">План:</span> ${plan} нч / мес, ставка ${rate} ₽/ч</div>` +
        `<div class="rate-line"><span class="rate-label">Факт нч:</span> ${factHours} нч (${percent}% плана)</div>` +
        `<div class="rate-line"><span class="rate-label">Оклад (до НДФЛ):</span> ${formatMoney(salary)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">НДФЛ 13% с оклада:</span> − ${formatMoney(salaryNdfl)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Оклад «на руки»:</span> ${formatMoney(salaryNet)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">База по нормо-часам:</span> ${formatMoney(basePay)} ₽ (факт нч × ставка)</div>` +
        `<div class="rate-line"><span class="rate-label">Коэффициент личного плана:</span> ${personalCoef.toFixed(3)}</div>` +
        `<div class="rate-line"><span class="rate-label">Доплата за личный план:</span> ${formatMoneySigned(personalBonus)}</div>` +
        `<div class="rate-line"><span class="rate-label">Коэффициент командного плана:</span> ${teamCoef.toFixed(2)}</div>` +
        `<div class="rate-line"><span class="rate-label">Доплата за командный план:</span> ${formatMoneySigned(teamBonus)}</div>` +
        `<div class="rate-line"><span class="rate-label">Общая премия (личный + командный план):</span> ${formatMoney(totalBonus)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Начислено всего (до НДФЛ):</span> ${formatMoney(grossTotal)} ₽</div>` +
        `<div class="rate-line"><span class="rate-label">Итого к выплате «на руки»:</span> <strong>${formatMoney(netTotal)} ₽</strong></div>` +
        `<div class="rate-line"><span class="rate-label">Сумма НДФЛ:</span> ${formatMoney(salaryNdfl)} ₽ (только с оклада)</div>`;

      detailsOut.innerHTML = html;
    }
  }

  ["change", "input"].forEach((evt) => {
    gradeEl?.addEventListener(evt, recalc);
    hoursEl?.addEventListener(evt, recalc);
    teamHoursEl?.addEventListener(evt, recalc);
  });

  recalc();
}
