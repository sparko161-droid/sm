document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('content');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  const setActive = (section) => {
    navLinks.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === section);
    });
  };

  const ensureStepperModal = () => {
    let backdrop = document.querySelector('.modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal-title">Шаг подсказки</div>
          <div class="modal-step-index"></div>
          <div class="modal-step-body"></div>
          <div class="modal-footer">
            <button type="button" class="btn modal-prev">Назад</button>
            <button type="button" class="btn modal-next">Дальше</button>
            <button type="button" class="btn modal-close">Закрыть</button>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);

      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('visible');
        }
      });
      const closeBtn = backdrop.querySelector('.modal-close');
      closeBtn.addEventListener('click', () => backdrop.classList.remove('visible'));
    }
    return backdrop;
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

  const initStepperModal = () => {
    const container = content;
    if (!container) return;
    const triggers = Array.from(container.querySelectorAll('[data-step-target]'));
    if (!triggers.length) return;

    const backdrop = ensureStepperModal();
    const modal = backdrop.querySelector('.modal');
    const titleEl = modal.querySelector('.modal-title');
    const idxEl = modal.querySelector('.modal-step-index');
    const bodyEl = modal.querySelector('.modal-step-body');
    const btnPrev = modal.querySelector('.modal-prev');
    const btnNext = modal.querySelector('.modal-next');

    let current = {
      steps: [],
      index: 0,
      label: ''
    };

    const render = () => {
      if (!current.steps.length) return;
      const step = current.steps[current.index];
      idxEl.textContent = `Шаг ${current.index + 1} из ${current.steps.length}`;
      bodyEl.innerHTML = step;
      titleEl.textContent = current.label || 'Подсказка';
    };

    btnPrev.onclick = () => {
      if (!current.steps.length) return;
      current.index = (current.index - 1 + current.steps.length) % current.steps.length;
      render();
    };

    btnNext.onclick = () => {
      if (!current.steps.length) return;
      current.index = (current.index + 1) % current.steps.length;
      render();
    };

    triggers.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-step-target');
        const list = container.querySelector('[data-step-list="' + id + '"]');
        if (!list) return;
        const items = Array.from(list.querySelectorAll('li')).map(li => {
          const span = li.querySelector('span:nth-child(2)');
          return span ? span.innerHTML : li.innerHTML;
        });
        if (!items.length) return;

        current.steps = items;
        current.index = 0;
        current.label = btn.textContent.replace(/▶\s*/,'').trim();
        render();
        backdrop.classList.add('visible');
      });
    });
  };

  const initAccordions = () => {
    const container = content;
    if (!container) return;
    const toggles = Array.from(container.querySelectorAll('[data-accordion-target]'));
    toggles.forEach(toggle => {
      const target = toggle.getAttribute('data-accordion-target');
      const panel = container.querySelector('[data-accordion="' + target + '"]');
      if (!panel) return;
      toggle.addEventListener('click', () => {
        panel.classList.toggle('open');
      });
    });
  };

  const loadSection = (name) => {
    fetch('sections/' + name + '.html?_=' + Date.now())
      .then(r => r.text())
      .then(html => {
        content.innerHTML = html;
        setActive(name);
        if (name === 'support') {
          initSupportFilters();
          initStepperModal();
          initAccordions();
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

  loadSection('support');
});
