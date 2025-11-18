// Lazy-loading support filters with remote sections
window.SupportFilters = {
  init(containerElement) {
    const container = containerElement;
    if (!container) return;

    const pills = Array.from(container.querySelectorAll('.subnav-pill[data-line-filter]'));
    const blocks = Array.from(container.querySelectorAll('.support-line'));
    if (!pills.length || !blocks.length) return;

    const loadedRemotes = new WeakSet();

    const loadRemoteIfNeeded = (block) => {
      const url = block.dataset.remote;
      if (!url) return Promise.resolve();
      if (loadedRemotes.has(block)) return Promise.resolve();

      return fetch(url, { credentials: 'same-origin' })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to load remote section: ' + url);
          }
          return response.text();
        })
        .then((html) => {
          block.innerHTML = html;
          loadedRemotes.add(block);

          try {
            if (window.SupportAccordions) {
              window.SupportAccordions.init(block);
            }
            if (window.SupportTemplates) {
              window.SupportTemplates.init(block);
            }
            if (window.QuizInit) {
              window.QuizInit.initForSection(block, 'support');
            }
            if (window.L1Calculator) {
              window.L1Calculator.init(block);
            }
            if (window.L2Calculator) {
              window.L2Calculator.init(block);
            }
            if (window.SupportProbation) {
              window.SupportProbation.init(block);
            }
          } catch (e) {
            console.warn('Error while initializing dynamic support block', e);
          }
        })
        .catch((err) => {
          console.error(err);
          if (!loadedRemotes.has(block)) {
            block.innerHTML = '<div class="callout callout-error">Не удалось загрузить раздел. Попробуйте обновить страницу.</div>';
          }
        });
    };

    const applyFilter = (value) => {
      blocks.forEach((block) => {
        const line = block.dataset.line;
        const shouldShow = !line || value === 'all' || value === line;

        if (shouldShow) {
          block.style.display = '';
          if (block.dataset.remote) {
            loadRemoteIfNeeded(block);
          }
        } else {
          block.style.display = 'none';
        }
      });
    };

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const value = pill.dataset.lineFilter;
        pills.forEach((p) => p.classList.toggle('active', p === pill));
        applyFilter(value);
      });
    });

    applyFilter('all');
  },
};
