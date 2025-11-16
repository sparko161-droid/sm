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

  const initL1Calculator = () => {
    const calculator = content.querySelector('[data-l1-calculator]');
    if (!calculator) return;
    const form = calculator.querySelector('form');
    if (!form) return;

    const outputs = {
      baseValue: calculator.querySelector('[data-output="baseValue"]'),
      baseHint: calculator.querySelector('[data-output="baseHint"]'),
      closedValue: calculator.querySelector('[data-output="closedValue"]'),
      closedHint: calculator.querySelector('[data-output="closedHint"]'),
      createdValue: calculator.querySelector('[data-output="createdValue"]'),
      createdHint: calculator.querySelector('[data-output="createdHint"]'),
      grossValue: calculator.querySelector('[data-output="grossValue"]'),
      netValue: calculator.querySelector('[data-output="netValue"]'),
      grossHint: calculator.querySelector('[data-output="grossHint"]'),
      taxValue: calculator.querySelector('[data-output="taxValue"]'),
      taxHint: calculator.querySelector('[data-output="taxHint"]'),
    };

    const overdueField = form.querySelector('[name="overdue"]');
    const overdueFieldWrapper = overdueField ? overdueField.closest('.calc-field') : null;

    const formatter = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    });

    const baseSalary = {
      '1': 23000,
      '2': 29000,
      '3': 32000,
    };

    const closingRules = {
      '1': [
        { max: 49, rate: 0 },
        { max: 99, rate: 20 },
        { max: Infinity, rate: 25 },
      ],
      '2': [
        { max: 49, rate: 0 },
        { max: 99, rate: 20 },
        { max: Infinity, rate: 25 },
      ],
      '3': [
        { max: 99, rate: 0 },
        { max: 115, rate: 23 },
        { max: 129, rate: 26 },
        { max: 144, rate: 29 },
        { max: Infinity, rate: 32 },
      ],
    };

    const creationRules = [
      { max: 299, rate: 0 },
      { max: 399, rate: 15 },
      { max: 499, rate: 20 },
      { max: Infinity, rate: 25 },
    ];

    const formatMoney = (value) => formatter.format(Math.round(value));

    const getRate = (value, rules) => {
      const found = rules.find(rule => value <= rule.max);
      return found ? found.rate : 0;
    };

    const getMissedAddon = (missed) => {
      if (missed <= 1.5) return 2;
      if (missed < 2) return 1;
      return 0;
    };

    const getOverdueAddon = (overdue) => {
      if (overdue <= 1) return 3;
      if (overdue <= 1.5) return 2;
      if (overdue <= 2) return 1;
      return 0;
    };

    const update = () => {
      const grade = form.elements['grade'].value || '1';
      const closed = Math.max(0, Number(form.elements['closed'].value) || 0);
      const created = Math.max(0, Number(form.elements['created'].value) || 0);
      const missed = Math.max(0, Number(form.elements['missed'].value) || 0);
      const overdue = Math.max(0, Number(form.elements['overdue'].value) || 0);

      if (overdueField) {
        overdueField.disabled = grade !== '3';
        if (grade !== '3') {
          overdueField.value = overdueField.value || '0';
        }
      }
      if (overdueFieldWrapper) {
        overdueFieldWrapper.classList.toggle('is-disabled', grade !== '3');
      }

      const base = baseSalary[grade] || 0;
      const closingRate = getRate(closed, closingRules[grade] || []);
      const closingAddon = grade === '3' ? getOverdueAddon(overdue) : 0;
      const closingTotalRate = closingRate + closingAddon;
      const closingBonus = closed * closingTotalRate;

      const creationRate = getRate(created, creationRules);
      const creationAddon = getMissedAddon(missed);
      const creationTotalRate = creationRate + creationAddon;
      const creationBonus = created * creationTotalRate;

      const gross = base + closingBonus + creationBonus;
      const tax = gross * 0.13;
      const net = gross - tax;

      if (outputs.baseValue) outputs.baseValue.textContent = formatMoney(base);
      if (outputs.baseHint) outputs.baseHint.textContent = `Грейд ${grade}`;

      if (outputs.closedValue) outputs.closedValue.textContent = formatMoney(closingBonus);
      if (outputs.closedHint) {
        const addonText = closingAddon ? ` (включая +${closingAddon.toFixed(0)} ₽)` : '';
        outputs.closedHint.textContent = `${closed} заявок × ${closingTotalRate.toFixed(0)} ₽${addonText}`;
      }

      if (outputs.createdValue) outputs.createdValue.textContent = formatMoney(creationBonus);
      if (outputs.createdHint) {
        const addonText = creationAddon ? ` (надбавка +${creationAddon.toFixed(0)} ₽)` : '';
        outputs.createdHint.textContent = `${created} заявок × ${creationTotalRate.toFixed(0)} ₽${addonText}`;
      }

      if (outputs.grossValue) outputs.grossValue.textContent = formatMoney(gross);
      if (outputs.netValue) outputs.netValue.textContent = formatMoney(net);
      if (outputs.grossHint) outputs.grossHint.textContent = `Из ${formatMoney(gross)} до вычета`;
      if (outputs.taxValue) outputs.taxValue.textContent = formatMoney(tax);
      if (outputs.taxHint) outputs.taxHint.textContent = `от ${formatMoney(gross)}`;
    };

    form.addEventListener('input', update);
    form.addEventListener('change', update);
    update();
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
