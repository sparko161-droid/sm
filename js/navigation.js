document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('content');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  const setActive = (section) => {
    navLinks.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === section);
    });
  };

  const initSupportFilters = () => {
    const container = content;
    if (!container) return;
    const pills = Array.from(container.querySelectorAll('.subnav-pill[data-line-filter]'));
    const blocks = Array.from(container.querySelectorAll('.support-line'));
    if (!pills.length || !blocks.length) return;

    const applyFilter = (value) => {
      blocks.forEach(block => {
        const line = block.dataset.line;
        if (!line || value === 'all' || value === line) {
          block.style.display = '';
        } else {
          block.style.display = 'none';
        }
      });
    };

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const value = pill.dataset.lineFilter;
        pills.forEach(p => p.classList.toggle('active', p === pill));
        applyFilter(value);
      });
    });

    applyFilter('all');
  };

  const initStepper = () => {
    const lists = Array.from(content.querySelectorAll('[data-step-list]'));
    if (!lists.length) return;

    lists.forEach(list => {
      const id = list.getAttribute('data-step-list');
      const btn = content.querySelector('[data-step-target="' + id + '"]');
      if (!btn) return;
      const items = Array.from(list.querySelectorAll('li'));
      let index = 0;

      const update = () => {
        items.forEach((li, i) => {
          li.classList.toggle('active', i === index);
        });
      };

      btn.addEventListener('click', () => {
        index = (index + 1) % items.length;
        update();
      });
    });
  };

  const initAccordions = () => {
    const toggles = Array.from(content.querySelectorAll('[data-accordion-target]'));
    toggles.forEach(toggle => {
      const target = toggle.getAttribute('data-accordion-target');
      const panel = content.querySelector('[data-accordion="' + target + '"]');
      if (!panel) return;
      toggle.addEventListener('click', () => {
        panel.classList.toggle('open');
      });
    });
  };

  const ndflRate = 0.13;

  const formatMoney = (value) => Math.round(value).toLocaleString('ru-RU');

  const initL1Calculator = () => {
    const card = content.querySelector('[data-calc-l1]');
    if (!card) return;

    const els = {
      grade: card.querySelector('#l1-grade'),
      resolved: card.querySelector('#l1-resolved'),
      created: card.querySelector('#l1-created'),
      missed: card.querySelector('#l1-missed'),
      overdue: card.querySelector('#l1-overdue'),
    };

    const outputs = {
      result: card.querySelector('[data-output="l1-result"]'),
      breakdown: card.querySelector('[data-output="l1-breakdown"]'),
    };

    const recalc = () => {
      const grade = Number(els.grade?.value || 1);
      const resolved = Math.max(0, Number(els.resolved?.value || 0));
      const created = Math.max(0, Number(els.created?.value || 0));
      const missed = Math.max(0, Number(els.missed?.value || 0));
      const overdue = Math.max(0, Number(els.overdue?.value || 0));

      const baseSalary = grade === 1 ? 23000 : grade === 2 ? 29000 : 32000;

      let resBase = 0;
      if (grade === 1 || grade === 2) {
        if (resolved >= 50 && resolved < 100) resBase = 20;
        else if (resolved >= 100) resBase = 25;
      } else {
        if (resolved >= 100 && resolved <= 115) resBase = 23;
        else if (resolved >= 116 && resolved <= 129) resBase = 26;
        else if (resolved >= 130 && resolved <= 144) resBase = 29;
        else if (resolved >= 145) resBase = 32;
      }

      let resBonus = 0;
      if (grade === 3) {
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
      const ndfl = baseSalary * ndflRate;
      const totalNet = totalGross - ndfl;

      if (outputs.result) {
        outputs.result.textContent = `ЗП L1: ${formatMoney(totalGross)} ₽ до вычета, ${formatMoney(totalNet)} ₽ после вычета (НДФЛ ${formatMoney(ndfl)} ₽ с оклада)`;
      }

      if (outputs.breakdown) {
        outputs.breakdown.innerHTML =
          `<div class="rate-line"><span class="rate-label">Оклад: </span>${formatMoney(baseSalary)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">Ставка закрытия (база): </span>${resBase.toFixed(2)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">+ бонус за просрочки: </span>${resBonus.toFixed(2)} ₽ → <strong>${resFinal.toFixed(2)} ₽ за закрытую заявку</strong></div>` +
          `<div class="rate-line"><span class="rate-label">Доход за закрытия: </span>${formatMoney(resSum)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">Ставка создания (база): </span>${crBase.toFixed(2)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">+ командный бонус (пропущенные звонки): </span>${crBonus.toFixed(2)} ₽ → <strong>${crFinal.toFixed(2)} ₽ за созданную заявку</strong></div>` +
          `<div class="rate-line"><span class="rate-label">Доход за создания: </span>${formatMoney(crSum)} ₽</div>`;
      }
    };

    Object.values(els).forEach((el) => {
      if (!el) return;
      el.addEventListener('input', recalc);
      el.addEventListener('change', recalc);
    });

    const triggerBtn = card.querySelector('[data-action="recalc-l1"]');
    if (triggerBtn) triggerBtn.addEventListener('click', recalc);

    recalc();
  };

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

  const initL2Calculator = () => {
    const card = content.querySelector('[data-calc-l2]');
    if (!card) return;

    const els = {
      grade: card.querySelector('#l2-grade'),
      city: card.querySelector('#l2-city'),
      resolved: card.querySelector('#l2-resolved'),
      overdue: card.querySelector('#l2-overdue'),
      teamPlan: card.querySelector('#l2-team-plan'),
      teamFact: card.querySelector('#l2-team-fact'),
      secondShifts: card.querySelector('#l2-second-shifts'),
    };

    const outputs = {
      result: card.querySelector('[data-output="l2-result"]'),
      breakdown: card.querySelector('[data-output="l2-breakdown"]'),
      updatesTotal: card.querySelector('[data-output="updates-total"]'),
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
      const overdue = Math.max(0, Number(els.overdue?.value || 0));
      const teamPlan = Math.max(0, Number(els.teamPlan?.value || 0));
      const teamFact = Math.max(0, Number(els.teamFact?.value || 0));
      const secondShiftsIncome = Math.max(0, Number(els.secondShifts?.value || 0));

      const baseOklads = [32000, 38000, 40000, 49000];
      const plans = [190, 220, 240, 240];
      const rateBaseArr = [52, 56, 60, 64];

      let baseSalary = baseOklads[grade - 1] || 0;
      if (cityType === 'plus30') {
        baseSalary = Math.round((baseSalary * 1.3) / 1000) * 1000;
      }

      const plan = plans[grade - 1] || 1;
      const rateBase = rateBaseArr[grade - 1] || 0;
      const ratio = plan > 0 ? resolved / plan : 0;

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
      const ticketsIncome = resolved * effRate;

      const updatesIncome = recalcUpdates();
      const totalGross = baseSalary + ticketsIncome + updatesIncome + secondShiftsIncome;
      const ndfl = baseSalary * ndflRate;
      const totalNet = totalGross - ndfl;

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
          `<div class="rate-line"><span class="rate-label">Доход за ${resolved} тикетов: </span>${formatMoney(ticketsIncome)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">Доход от ночных обновлений: </span>${formatMoney(updatesIncome)} ₽</div>` +
          `<div class="rate-line"><span class="rate-label">Доход за вторые смены (ручной ввод): </span>${formatMoney(secondShiftsIncome)} ₽</div>`;
      }
    };

    const addRow = () => {
      if (!updatesTable) return;
      rowId += 1;
      const row = document.createElement('tr');
      row.dataset.rowId = String(rowId);
      row.innerHTML = `
        <td>${rowId}</td>
        <td><input type="number" min="1" value="1" class="calc-input" data-update-terminals /></td>
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

    // Стартуем с одной строки обновлений, чтобы калькулятор сразу показывал полный расклад
    addRow();

    recalc();
  };

  const loadSection = (name) => {
    fetch('sections/' + name + '.html?_=' + Date.now())
      .then(r => r.text())
      .then(html => {
        content.innerHTML = html;
        setActive(name);
        if (name === 'support') {
          initSupportFilters();
          initStepper();
          initAccordions();
          initL1Calculator();
          initL2Calculator();
        }
      })
      .catch(() => {
        content.innerHTML = '<p>Ошибка загрузки раздела.</p>';
      });
  };

  navLinks.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const section = btn.dataset.section;
      loadSection(section);
    });
  });

  loadSection('dashboard');
});
