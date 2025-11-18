window.L1Calculator = {
  init(containerElement) {
    const card = containerElement?.querySelector('[data-calc-l1]');
    if (!card) return;

    const ndflRate = 0.13;
    const formatMoney = (value) => Math.round(value).toLocaleString('ru-RU');

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
      totalGross: card.querySelector('[data-output="l1-total-gross"]'),
      totalNet: card.querySelector('[data-output="l1-total-net"]'),
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

      if (outputs.totalGross) outputs.totalGross.textContent = `${formatMoney(totalGross)} ₽`;
      if (outputs.totalNet) outputs.totalNet.textContent = `${formatMoney(totalNet)} ₽`;

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
  }
};
