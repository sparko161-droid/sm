// Interactive probation status calculator
window.SupportProbation = {
  init(containerElement) {
    if (!containerElement) return;

    const tables = Array.from(containerElement.querySelectorAll('[data-probation-table]'));
    if (!tables.length) return;

    const updateRow = (row) => {
      const checks = Array.from(row.querySelectorAll('.probation-check'));
      const statusCell = row.querySelector('[data-probation-status]');
      const badge = statusCell?.querySelector('.probation-status-badge');
      if (!checks.length || !badge) return;

      const total = checks.length;
      const checked = checks.filter((c) => c.checked).length;
      const ratio = total > 0 ? checked / total : 0;

      let status = 'in-progress';
      let text = 'В работе';
      let color = '#eab308';
      let borderColor = '#eab308';

      if (ratio >= 0.8) {
        status = 'passed';
        text = 'Пройден';
        color = '#22c55e';
        borderColor = '#22c55e';
      } else if (ratio < 0.5) {
        status = 'failed';
        text = 'Не пройден';
        color = '#ef4444';
        borderColor = '#ef4444';
      } else {
        status = 'extend';
        text = 'Продлить';
      }

      badge.textContent = text;
      badge.dataset.status = status;
      badge.style.color = color;
      badge.style.borderColor = borderColor;
      badge.title = `Заполнено ${checked} из ${total} критериев (${Math.round(ratio * 100)}%)`;
    };

    const attachTable = (table) => {
      const rows = Array.from(table.querySelectorAll('[data-probation-row]'));
      rows.forEach((row) => {
        const checks = Array.from(row.querySelectorAll('.probation-check'));
        checks.forEach((checkbox) => {
          checkbox.addEventListener('change', () => updateRow(row));
        });
        updateRow(row);
      });
    };

    tables.forEach(attachTable);
  },
};
