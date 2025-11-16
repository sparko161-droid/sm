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
