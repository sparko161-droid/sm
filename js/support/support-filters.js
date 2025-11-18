window.SupportFilters = {
  init(containerElement) {
    const container = containerElement;
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
  }
};
