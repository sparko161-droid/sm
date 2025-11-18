window.L2Calculator = {
  init(containerElement) {
    const card = containerElement?.querySelector('[data-calc-l2]');
    if (!card) return;

    const ndflRate = 0.13;
    const formatMoney = (value) => Math.round(value).toLocaleString('ru-RU');

    const updatePriceForTerminals = (n) => {
      if (n <= 0) return 0;
      if (n === 1) return 1000;
      if (n === 2) return 1500;
      if (n === 3) return 2250;
      if (n === 4) return 2400;
      if (n === 5) return 3000;
      if (n === 6) return 3600;
      if (n === 7) return 4200;
      if (n === 8) return 4800;
      if (n === 9) return 5400;
      if (n >= 10 && n < 50) return 500 * n;
      return 400 * n;
    };

    const els = {
      grade: card.querySelector('#l2-grade'),
      city: card.querySelector('#l2-city'),
      resolved: card.querySelector('#l2-resolved'),
      onsite: card.querySelector('#l2-onsite'),
      overdue: card.querySelector('#l2-overdue'),
      teamPlan: card.querySelector('#l2-team-plan'),
      teamFact: card.querySelector('#l2-team-fact'),
      secondShifts: card.querySelector('#l2-second-shifts'),
      summerSetup: card.querySelector('#l2-summer-setup'),
      transfer: card.querySelector('#l2-transfer'),
    };

    const outputs = {
      result: card.querySelector('[data-output="l2-result"]'),
      breakdown: card.querySelector('[data-output="l2-breakdown"]'),
      updatesTotal: card.querySelector('[data-output="updates-total"]'),
      totalGross: card.querySelector('[data-output="l2-total-gross"]'),
      totalNet: card.querySelector('[data-output="l2-total-net"]'),
      bonusTotal: card.querySelector('[data-output="l2-bonus-total"]'),
    };

    const updatesTable = card.querySelector('[data-updates-table] tbody');
    const addRowBtn = card.querySelector('[data-action="add-update-row"]');
    let rowId = 0;

    const recalcUpdates = () => {
      const rows = Array.from(updatesTable?.querySelectorAll('tr') || []);
      let totalIncome = 0;
      rows.forEach((row) => {
        const input = row.querySelector('input');
        const terminals = Math.max(0, Number(input?.value || 0));
        const price = updatePriceForTerminals(terminals);
        const income = terminals > 0 ? Math.max(price * 0.3, 500) : 0;
        const priceCell = row.querySelector('.upd-price');
        const incomeCell = row.querySelector('.upd-income');
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
      const grade = Number(els.grade?.value || 1);
      const cityType = els.city?.value || 'base';
      const resolved = Math.max(0, Number(els.resolved?.value || 0));
      const onsite = Math.max(0, Number(els.onsite?.value || 0));
      const overdue = Math.max(0, Number(els.overdue?.value || 0));
      const teamPlan = Math.max(0, Number(els.teamPlan?.value || 0));
      const teamFact = Math.max(0, Number(els.teamFact?.value || 0));
      const secondShiftsIncome = Math.max(0, Number(els.secondShifts?.value || 0));
      const summerSetup = Math.max(0, Number(els.summerSetup?.value || 0));
      const transfer = Math.max(0, Number(els.transfer?.value || 0));

      const baseOklads = [32000, 38000, 40000, 49000];
      const plans = [190, 220, 240, 240];
      const rateBaseArr = [52, 56, 60, 64];

      let baseSalary = baseOklads[grade - 1] || 0;
      if (cityType === 'plus30') {
        baseSalary = Math.round((baseSalary * 1.3) / 1000) * 1000;
      }

      const plan = plans[grade - 1] || 1;
      const rateBase = rateBaseArr[grade - 1] || 0;
      const totalTicketsForPlan = resolved + onsite;
      const ratio = plan > 0 ? totalTicketsForPlan / plan : 0;

      let coef = 0;
      if (ratio >= 1) coef = 1;
      else if (ratio >= 0.9) coef = 0.9;
      else if (ratio >= 0.8) coef = 0.8;
      else if (ratio >= 0.7) coef = 0.7;

      let overdueBonusRate = 0;
      if (grade === 4) {
        if (overdue < 4) overdueBonusRate = 10;
        else if (overdue >= 4 && overdue < 5) overdueBonusRate = 7;
        else if (overdue >= 5 && overdue < 6) overdueBonusRate = 5;
      } else {
        if (overdue < 4) overdueBonusRate = 7;
        else if (overdue >= 4 && overdue < 5) overdueBonusRate = 5;
        else if (overdue >= 5 && overdue < 6) overdueBonusRate = 3;
      }

      let teamBonusRate = 0;
      if (teamPlan > 0) {
        const delta = teamFact - teamPlan;
        if (delta >= 0 && delta <= 100) teamBonusRate = grade === 4 ? 5 : 3;
        else if (delta > 100 && delta <= 199) teamBonusRate = grade === 4 ? 7 : 5;
        else if (delta >= 200) teamBonusRate = grade === 4 ? 10 : 7;
      }

      const perTicketAfterPlan = rateBase * coef;
      const effRate = perTicketAfterPlan + overdueBonusRate + teamBonusRate;
      const ticketsIncome = totalTicketsForPlan * effRate;

      const onsiteGsmBonus = onsite * 100;
      const summerIncome = summerSetup * 300;
      const transferIncome = transfer * 500;

      const updatesIncome = recalcUpdates();
      const bonuses = ticketsIncome + updatesIncome + secondShiftsIncome + onsiteGsmBonus + summerIncome + transferIncome;
      const totalGross = baseSalary + bonuses;
      const ndfl = baseSalary * ndflRate;
      const totalNet = totalGross - ndfl;

      if (outputs.totalGross) outputs.totalGross.textContent = `${formatMoney(totalGross)} ₽`;
      if (outputs.totalNet) outputs.totalNet.textContent = `${formatMoney(totalNet)} ₽`;
      if (outputs.bonusTotal) outputs.bonusTotal.textContent = `${formatMoney(bonuses)} ₽`;

      if (outputs.result) {
        outputs.result.textContent = `ЗП L2: ${formatMoney(totalGross)} ₽ до вычета, ${formatMoney(totalNet)} ₽ после вычета (НДФЛ ${formatMoney(ndfl)} ₽ с оклада)`;
      }

      if (outputs.breakdown) {
        outputs.breakdown.innerHTML =
          `<div class="rate-line"><span class="rate-label">Оклад (с учётом города): </span>${formatMoney(baseSalary)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">Базовая ставка грейда: </span>${rateBase.toFixed(2)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">× коэффициент выполнения плана: </span>${coef.toFixed(2)} → ${perTicketAfterPlan.toFixed(2)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">+ бонус за низкие просрочки: </span>${overdueBonusRate.toFixed(2)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">+ командный бонус: </span>${teamBonusRate.toFixed(2)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">Итоговая ставка за тикет: </span><strong>${effRate.toFixed(2)} ₽</strong></div>` +
          `<div class="rate-line"><span class="rate-label">Учитываем в плане: </span>${totalTicketsForPlan} тикетов (включая ${onsite} выезд${onsite === 1 ? '' : 'ов'})</div>` +
          `<div class="rate-line"><span class="rate-label">Доход за тикеты и выезды: </span>${formatMoney(ticketsIncome)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">Доход от ночных обновлений: </span>${formatMoney(updatesIncome)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">Доход за вторые смены (ручной ввод): </span>${formatMoney(secondShiftsIncome)} ₽</div>`;

        const addons =
          `<div class="rate-line"><span class="rate-label">ГСМ за выезды: </span>${formatMoney(onsiteGsmBonus)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">Выставление летника / ЧЗ: </span>${formatMoney(summerIncome)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">Перенос в клад: </span>${formatMoney(transferIncome)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">Итого премии и доплат: </span><strong>${formatMoney(bonuses)} ₽</strong></div>`;

        outputs.breakdown.innerHTML += addons;
      }
    };

    const addRow = () => {
      if (!updatesTable) return;
      rowId += 1;
      const row = document.createElement('tr');
      row.dataset.rowId = String(rowId);
      row.innerHTML = `
        <td>${rowId}</td>
        <td><input type="number" min="1" value="1" class="calc-input updates-terminals" data-update-terminals /></td>
        <td class="upd-price">0 ₽</td>
        <td class="upd-income">0 ₽</td>
        <td><button type="button" data-remove-update>✕</button></td>
      `;
      updatesTable.appendChild(row);
      recalc();
    };

    if (addRowBtn) addRowBtn.addEventListener('click', addRow);

    if (updatesTable) {
      updatesTable.addEventListener('input', (event) => {
        const target = event.target;
        if (target instanceof HTMLInputElement && target.dataset.updateTerminals !== undefined) {
          recalc();
        }
      });

      updatesTable.addEventListener('click', (event) => {
        const target = event.target;
        if (target instanceof HTMLButtonElement && target.dataset.removeUpdate !== undefined) {
          const row = target.closest('tr');
          if (row) {
            row.remove();
            recalc();
          }
        }
      });
    }

    Object.values(els).forEach((el) => {
      if (!el) return;
      el.addEventListener('input', recalc);
      el.addEventListener('change', recalc);
    });

    const triggerBtn = card.querySelector('[data-action="recalc-l2"]');
    if (triggerBtn) triggerBtn.addEventListener('click', recalc);

    addRow();

    recalc();
  }
};
