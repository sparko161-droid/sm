document.addEventListener('DOMContentLoaded', () => {
  const root = document;

  function byId(id) {
    return root.getElementById(id);
  }

  // L1 calculator
  function calcL1() {
    const grade = parseInt(byId('l1-grade')?.value || '1', 10);
    const closed = parseInt(byId('l1-closed')?.value || '0', 10) || 0;
    const created = parseInt(byId('l1-created')?.value || '0', 10) || 0;
    const missed = parseFloat(byId('l1-missed')?.value || '0') || 0;
    const overdue = parseFloat(byId('l1-overdue')?.value || '0') || 0;
    const out = byId('l1-result');
    if (!out) return;

    const baseSalaryMap = {1: 23000, 2: 29000, 3: 32000};
    const base = baseSalaryMap[grade] || 0;

    // ставка за закрытие заявок
    let closeRate = 0;
    if (grade === 1 || grade === 2) {
      if (closed >= 50 && closed <= 99) closeRate = 20;
      else if (closed >= 100) closeRate = 25;
    } else if (grade === 3) {
      if (closed >= 100 && closed <= 115) closeRate = 23;
      else if (closed >= 116 && closed <= 129) closeRate = 26;
      else if (closed >= 130 && closed <= 144) closeRate = 29;
      else if (closed >= 145) closeRate = 32;
    }
    let closeBonus = closeRate * closed;

    // ставка за создание заявок
    let createRate = 0;
    if (created >= 300 && created <= 399) createRate = 15;
    else if (created >= 400 && created <= 499) createRate = 20;
    else if (created >= 500) createRate = 25;

    // надбавка за % пропущенных (к ставке за создание)
    let missedAdd = 0;
    if (missed <= 1.5) missedAdd = 2;
    else if (missed > 1.5 && missed < 2) missedAdd = 1;

    const createBonus = (createRate + missedAdd) * created;

    // доп. мотивация за просроченные задачи (только 3 грейд, к ставке за закрытие)
    let overdueAdd = 0;
    if (grade === 3) {
      if (overdue <= 1) overdueAdd = 3;
      else if (overdue > 1 && overdue <= 1.5) overdueAdd = 2;
      else if (overdue > 1.5 && overdue <= 2) overdueAdd = 1;
    }
    const overdueBonus = overdueAdd * closed;

    const total = base + closeBonus + createBonus + overdueBonus;

    out.innerHTML = `
      <div>Базовый оклад: <strong>${base.toLocaleString('ru-RU')} ₽</strong></div>
      <div>Премия за <strong>${closed}</strong> закрытых заявок: <strong>${closeBonus.toLocaleString('ru-RU')} ₽</strong></div>
      <div>Премия за <strong>${created}</strong> созданных заявок (с учётом % пропущенных): <strong>${createBonus.toLocaleString('ru-RU')} ₽</strong></div>
      <div>Доп. мотивация за просроченные задачи: <strong>${overdueBonus.toLocaleString('ru-RU')} ₽</strong></div>
      <hr>
      <div><strong>Итого L1: ${total.toLocaleString('ru-RU')} ₽</strong></div>
    `;
  }

  ['l1-grade','l1-closed','l1-created','l1-missed','l1-overdue'].forEach(id => {
    const el = byId(id);
    if (el) el.addEventListener('input', calcL1);
  });

  // L2 calculator
  function calcL2() {
    const grade = parseInt(byId('l2-grade')?.value || '1', 10);
    const city = byId('l2-city')?.value || 'base';
    const closed = parseInt(byId('l2-closed')?.value || '0', 10) || 0;
    const teamDelay = parseFloat(byId('l2-team-delay')?.value || '0') || 0;
    const teamExtra = parseInt(byId('l2-team-extra')?.value || '0', 10) || 0;

    const outdoor = parseInt(byId('l2-outdoor')?.value || '0', 10) || 0;
    const gsmRate = parseFloat(byId('l2-gsm')?.value || '0') || 0;
    const chz = parseInt(byId('l2-chz')?.value || '0', 10) || 0;
    const kladu = parseInt(byId('l2-kladu')?.value || '0', 10) || 0;
    const letnik = parseInt(byId('l2-letnik')?.value || '0', 10) || 0;
    const dutyWeek = parseInt(byId('l2-duty-week')?.value || '0', 10) || 0;
    const dutyWeekend = parseInt(byId('l2-duty-weekend')?.value || '0', 10) || 0;
    const dutyHoliday = parseInt(byId('l2-duty-holiday')?.value || '0', 10) || 0;
    const updateSum = parseFloat(byId('l2-update-sum')?.value || '0') || 0;

    const out = byId('l2-result');
    if (!out) return;

    const baseMap = {1: 32000, 2: 38000, 3: 40000, 4: 49000};
    let base = baseMap[grade] || 0;
    if (city === 'big') {
      base = Math.round((base * 1.3) / 1000) * 1000;
    }

    const planMap = {1: 190, 2: 220, 3: 240, 4: 240};
    const rateMap = {1: 52, 2: 56, 3: 60, 4: 64};
    const plan = planMap[grade] || 0;
    const fullRate = rateMap[grade] || 0;

    const perc = plan ? (closed / plan) * 100 : 0;
    let coef = 0;
    if (perc >= 100) coef = 1.0;
    else if (perc >= 90) coef = 0.9;
    else if (perc >= 80) coef = 0.8;
    else if (perc >= 70) coef = 0.7;

    const personalRate = fullRate * coef;

    // надбавка за % просроченных (к ставке)
    let delayAdd = 0;
    if (grade <= 3) {
      if (teamDelay < 4) delayAdd = 7;
      else if (teamDelay >= 4 && teamDelay < 5) delayAdd = 5;
      else if (teamDelay >= 5 && teamDelay < 6) delayAdd = 3;
    } else {
      if (teamDelay < 4) delayAdd = 10;
      else if (teamDelay >= 4 && teamDelay < 5) delayAdd = 7;
      else if (teamDelay >= 5 && teamDelay < 6) delayAdd = 5;
    }

    // командный результат
    let teamAdd = 0;
    if (grade <= 3) {
      if (teamExtra === 1) teamAdd = 3;
      else if (teamExtra === 2) teamAdd = 5;
      else if (teamExtra === 3) teamAdd = 7;
    } else {
      if (teamExtra === 1) teamAdd = 5;
      else if (teamExtra === 2) teamAdd = 7;
      else if (teamExtra === 3) teamAdd = 10;
    }

    const perTicket = personalRate + delayAdd + teamAdd;
    const ticketsBonus = perTicket * closed;

    // Доп. подработки
    const outdoorBonus = outdoor * gsmRate; // плюс к обычной ставке за тикет идёт отдельно
    const chzBonus = chz * 300;
    const kladuBonus = kladu * 500;
    const letnikBonus = letnik * 300;
    const dutyBonus = dutyWeek * 500 + dutyWeekend * 1000 + dutyHoliday * 2000;
    const updateBonus = updateSum * 0.3;

    const extras = outdoorBonus + chzBonus + kladuBonus + letnikBonus + dutyBonus + updateBonus;

    const total = base + ticketsBonus + extras;

    out.innerHTML = `
      <div>Базовый оклад: <strong>${base.toLocaleString('ru-RU')} ₽</strong></div>
      <div>Премия за <strong>${closed}</strong> закрытых заявок: <strong>${ticketsBonus.toLocaleString('ru-RU')} ₽</strong></div>
      <div>Доплаты за качество (% просроченных, общий план): <strong>${(delayAdd + teamAdd).toLocaleString('ru-RU')} ₽ / заявка</strong></div>
      <div>Доп. подработки (выезды, ЧЗ, летники, дежурства, обновления): <strong>${extras.toLocaleString('ru-RU')} ₽</strong></div>
      <hr>
      <div><strong>Итого L2: ${total.toLocaleString('ru-RU')} ₽</strong></div>
    `;
  }

  ['l2-grade','l2-city','l2-closed','l2-team-delay','l2-team-extra',
   'l2-outdoor','l2-gsm','l2-chz','l2-kladu','l2-letnik','l2-duty-week',
   'l2-duty-weekend','l2-duty-holiday','l2-update-sum'
  ].forEach(id => {
    const el = byId(id);
    if (el) el.addEventListener('input', calcL2);
  });

  // попытка посчитать при первой загрузке, если элементы уже на странице
  calcL1();
  calcL2();
});
