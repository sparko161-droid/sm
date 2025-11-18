// ProbationTable: checklist-driven probation tracking with filters and localStorage persistence
const STORAGE_KEY = 'support_probation_status_v1';

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save probation state', e);
  }
}

function init(containerElement) {
  const root = containerElement.querySelector('[data-probation-root]');
  if (!root) return;

  const table = root.querySelector('[data-probation-table]');
  if (!table) return;

  const filters = Array.from(root.querySelectorAll('.probation-filter'));
  const state = loadState();

  const applyFilters = () => {
    const filterValues = {};
    filters.forEach((select) => {
      filterValues[select.dataset.filter] = select.value;
    });

    const rows = Array.from(table.tBodies[0].rows);
    rows.forEach((row) => {
      let visible = true;

      const lineFilter = filterValues.line;
      const rowLine = row.dataset.line || 'all';
      if (lineFilter && lineFilter !== 'all' && rowLine !== lineFilter) {
        visible = false;
      }

      const statusFilter = filterValues.status;
      const rowStatus = row.dataset.status || 'in-progress';
      if (statusFilter && statusFilter !== 'all' && rowStatus !== statusFilter) {
        visible = false;
      }

      row.style.display = visible ? '' : 'none';
    });
  };

  const updateRow = (row) => {
    const checks = Array.from(row.querySelectorAll('.probation-check'));
    const statusCell = row.querySelector('[data-probation-status]');
    const badge = statusCell ? statusCell.querySelector('.probation-status-badge') : null;
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

    row.dataset.status = status;
    applyFilters();
  };

  const rows = Array.from(table.querySelectorAll('tr[data-id]'));

  // Restore saved state
  rows.forEach((row) => {
    const id = row.getAttribute('data-id');
    const rowState = state[id] || {};
    const checkboxes = Array.from(
      row.querySelectorAll('input[type="checkbox"][data-cell]')
    );
    checkboxes.forEach((input) => {
      const cellKey = input.getAttribute('data-cell');
      if (rowState && typeof rowState[cellKey] === 'boolean') {
        input.checked = rowState[cellKey];
      }
    });
    updateRow(row);
  });

  // Bind listeners
  rows.forEach((row) => {
    const checkboxes = Array.from(row.querySelectorAll('input[type="checkbox"][data-cell]'));
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const id = row.getAttribute('data-id');
        const cellKey = checkbox.getAttribute('data-cell');
        if (id && cellKey) {
          if (!state[id]) state[id] = {};
          state[id][cellKey] = checkbox.checked;
          saveState(state);
        }
        updateRow(row);
      });
    });
  });

  filters.forEach((select) => {
    select.addEventListener('change', applyFilters);
  });

  applyFilters();
}

const ProbationTable = { init };

export default ProbationTable;
