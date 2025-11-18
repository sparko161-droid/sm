import SupportAccordions from "/sm/js/modules/support/support-accordions.js";
import SupportTemplates from "/sm/js/modules/support/support-templates.js";

// Lazy-loading support filters with remote sections (adapted for SPA)
const SupportFilters = {
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
            SupportAccordions.init(block);
            SupportTemplates.init(block);
          } catch (e) {
            console.warn('Error while initializing dynamic support block', e);
          }
        })
        .catch((err) => {
          console.error(err);
          if (!loadedRemotes.has(block)) {
            block.innerHTML =
              '<div class="callout callout-error">Не удалось загрузить раздел. Попробуйте обновить страницу.</div>';
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
  }
};

export default SupportFilters;
