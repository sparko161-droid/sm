// js/modules/filters/main.js
//
// Редактор filters.json (Шаг 6.1).
// Работает ТОЛЬКО в локальной модели (в памяти), без сохранения в GitHub/n8n.
// На Шаге 6.2 поверх этого экрана добавим кнопку "Сохранить фильтры" и интеграцию с n8n.

import ContentService from "/sm/js/core/contentService.js";
import { saveFilters } from "/sm/js/api/filtersApi.js";

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj || null));
}

function createLayout(container) {
  container.innerHTML = `
    <section class="page page--filters-editor">
      <header class="page-header">
        <h1 class="page-title">Редактор фильтров</h1>
        <p class="page-description">
          Локальный редактор <code>content/filters.json</code>. Изменения пока не сохраняются в GitHub.
        </p>
      </header>

      <div class="filters-editor-grid">
        <div class="filters-editor-column" data-filters-lines>
          <h2 class="filters-editor-title">Линии (lines)</h2>
          <ul class="filters-list" data-lines-list></ul>
          <button type="button" class="btn btn--ghost" data-action="add-line">Добавить линию</button>
        </div>

        <div class="filters-editor-column" data-filters-case-types>
          <h2 class="filters-editor-title">Типы кейсов (caseTypes)</h2>
          <ul class="filters-list" data-case-types-list></ul>
          <button type="button" class="btn btn--ghost" data-action="add-case-type">Добавить тип кейса</button>
        </div>

        <div class="filters-editor-column" data-filters-categories>
          <h2 class="filters-editor-title">Категории (categories)</h2>
          <ul class="filters-list" data-categories-list></ul>
          <button type="button" class="btn btn--ghost" data-action="add-category">Добавить категорию</button>
        </div>
      </div>

      <section class="filters-editor-relations">
        <h2 class="filters-editor-title">Связи: линия ↔ тип кейса</h2>
        <p class="small text-muted">
          Для каждого типа кейса можно указать, к каким линиям он относится. 
          В JSON это хранится в поле <code>lines: string[]</code> у объекта caseType.
        </p>
        <div class="filters-relations" data-relations-root></div>
      </section>

            <footer class="page-footer">
        <div class="filters-editor-actions">
          <button type="button" class="btn btn--primary" data-action="save-filters">
            Сохранить filters.json в GitHub
          </button>
        </div>
        <p class="small text-muted">
          ⚠ На этом шаге редактор работает только с одним файлом <code>filters.json</code>.
          Сохранение идёт через n8n → GitHub Contents API.
        </p>
      </footer>
    </section>
  `;
}

function ensureStructure(filtersJson) {
  const safe = filtersJson || {};
  safe.lines = Array.isArray(safe.lines) ? safe.lines : [];
  safe.caseTypes = Array.isArray(safe.caseTypes) ? safe.caseTypes : [];
  safe.categories = Array.isArray(safe.categories) ? safe.categories : [];
  return safe;
}

function renderLines(container, localState) {
  const list = container.querySelector("[data-lines-list]");
  if (!list) return;
  list.innerHTML = "";

  const lines = localState.filters.lines || [];
  lines.forEach((line, index) => {
    const li = document.createElement("li");
    li.className = "filters-list-item";
    li.dataset.lineId = line.id || "";

    const id = line.id || "";
    const label = line.label || "";
    const order = typeof line.order === "number" ? line.order : index + 1;

    li.innerHTML = `
      <div class="filters-list-row">
        <input type="text" class="input input--sm" data-field="line-id" value="${id}" placeholder="id (L1, L2, ...)" />
        <input type="text" class="input input--sm" data-field="line-label" value="${label}" placeholder="Название линии" />
        <input type="number" class="input input--sm" data-field="line-order" value="${order}" min="1" />
        <button type="button" class="btn btn--ghost btn--icon" data-role="delete-line" title="Удалить линию">✕</button>
      </div>
    `;

    list.appendChild(li);
  });
}

function renderCaseTypes(container, localState) {
  const list = container.querySelector("[data-case-types-list]");
  if (!list) return;
  list.innerHTML = "";

  const caseTypes = localState.filters.caseTypes || [];
  caseTypes.forEach((ct, index) => {
    const li = document.createElement("li");
    li.className = "filters-list-item";
    li.dataset.caseTypeId = ct.id || "";

    const id = ct.id || "";
    const label = ct.label || "";
    const order = typeof ct.order === "number" ? ct.order : index + 1;

    li.innerHTML = `
      <div class="filters-list-row">
        <input type="text" class="input input--sm" data-field="caseType-id" value="${id}" placeholder="id (например, technical)" />
        <input type="text" class="input input--sm" data-field="caseType-label" value="${label}" placeholder="Название типа кейса" />
        <input type="number" class="input input--sm" data-field="caseType-order" value="${order}" min="1" />
        <button type="button" class="btn btn--ghost btn--icon" data-role="delete-case-type" title="Удалить тип кейса">✕</button>
      </div>
    `;

    list.appendChild(li);
  });
}

function renderCategories(container, localState) {
  const list = container.querySelector("[data-categories-list]");
  if (!list) return;
  list.innerHTML = "";

  const categories = localState.filters.categories || [];
  categories.forEach((cat, index) => {
    const li = document.createElement("li");
    li.className = "filters-list-item";
    li.dataset.categoryId = cat.id || "";

    const id = cat.id || "";
    const label = cat.label || "";
    const order = typeof cat.order === "number" ? cat.order : index + 1;

    li.innerHTML = `
      <div class="filters-list-row">
        <input type="text" class="input input--sm" data-field="category-id" value="${id}" placeholder="id категории" />
        <input type="text" class="input input--sm" data-field="category-label" value="${label}" placeholder="Название категории" />
        <input type="number" class="input input--sm" data-field="category-order" value="${order}" min="1" />
        <button type="button" class="btn btn--ghost btn--icon" data-role="delete-category" title="Удалить категорию">✕</button>
      </div>
    `;

    list.appendChild(li);
  });
}

function renderRelations(container, localState) {
  const root = container.querySelector("[data-relations-root]");
  if (!root) return;
  root.innerHTML = "";

  const lines = localState.filters.lines || [];
  const caseTypes = localState.filters.caseTypes || [];

  if (!caseTypes.length || !lines.length) {
    root.innerHTML = `<p class="small text-muted">Чтобы редактировать связи, добавьте хотя бы одну линию и один тип кейса.</p>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "filters-relations-table";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.innerHTML = `<th>Тип кейса</th>` + lines.map(l => `<th>${l.label || l.id}</th>`).join(""\);
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  caseTypes.forEach((ct) => {
    const tr = document.createElement("tr");
    tr.dataset.caseTypeId = ct.id || "";

    const titleCell = document.createElement("td");
    titleCell.textContent = ct.label || ct.id || "(без названия)";
    tr.appendChild(titleCell);

    const activeLines = Array.isArray(ct.lines) ? ct.lines : [];

    lines.forEach((line) => {
      const td = document.createElement("td");
      td.className = "filters-relations-cell";
      const checked = activeLines.includes(line.id);
      td.innerHTML = `
        <label class="filters-relations-checkbox">
          <input type="checkbox" data-role="toggle-relation" data-case-type-id="${ct.id}" data-line-id="${line.id}" ${checked ? "checked" : ""} />
        </label>
      `;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  root.appendChild(table);
}

function attachLinesHandlers(container, localState) {
  const list = container.querySelector("[data-lines-list]");
  const addBtn = container.querySelector("[data-action='add-line']");

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      localState.filters.lines = localState.filters.lines || [];
      const idx = localState.filters.lines.length + 1;
      localState.filters.lines.push({
        id: "L" + idx,
        label: "Линия " + idx,
        order: idx
      });
      renderLines(container, localState);
      renderRelations(container, localState);
    });
  }

  if (list) {
    list.addEventListener("input", (event) => {
      const row = event.target.closest(".filters-list-item");
      if (!row) return;
      const index = Array.from(list.children).indexOf(row);
      if (index === -1) return;

      const line = localState.filters.lines[index];
      if (!line) return;

      const field = event.target.getAttribute("data-field");
      if (field === "line-id") {
        line.id = event.target.value.trim();
      } else if (field === "line-label") {
        line.label = event.target.value;
      } else if (field === "line-order") {
        const num = parseInt(event.target.value, 10);
        line.order = isNaN(num) ? index + 1 : num;
      }

      renderRelations(container, localState);
    });

    list.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-role='delete-line']");
      if (!btn) return;
      const row = btn.closest(".filters-list-item");
      if (!row) return;
      const index = Array.from(list.children).indexOf(row);
      if (index === -1) return;

      localState.filters.lines.splice(index, 1);

      const removedLineId = row.dataset.lineId;
      if (removedLineId) {
        (localState.filters.caseTypes || []).forEach(ct => {
          if (Array.isArray(ct.lines)) {
            ct.lines = ct.lines.filter(id => id !== removedLineId);
          }
        });
      }

      renderLines(container, localState);
      renderRelations(container, localState);
    });
  }
}

function attachCaseTypesHandlers(container, localState) {
  const list = container.querySelector("[data-case-types-list]");
  const addBtn = container.querySelector("[data-action='add-case-type']");

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      localState.filters.caseTypes = localState.filters.caseTypes || [];
      const idx = localState.filters.caseTypes.length + 1;
      localState.filters.caseTypes.push({
        id: "case-" + idx,
        label: "Тип кейса " + idx,
        order: idx,
        lines: []
      });
      renderCaseTypes(container, localState);
      renderRelations(container, localState);
    });
  }

  if (list) {
    list.addEventListener("input", (event) => {
      const row = event.target.closest(".filters-list-item");
      if (!row) return;
      const index = Array.from(list.children).indexOf(row);
      if (index === -1) return;

      const ct = localState.filters.caseTypes[index];
      if (!ct) return;

      const field = event.target.getAttribute("data-field");
      if (field === "caseType-id") {
        ct.id = event.target.value.trim();
      } else if (field === "caseType-label") {
        ct.label = event.target.value;
      } else if (field === "caseType-order") {
        const num = parseInt(event.target.value, 10);
        ct.order = isNaN(num) ? index + 1 : num;
      }

      renderRelations(container, localState);
    });

    list.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-role='delete-case-type']");
      if (!btn) return;
      const row = btn.closest(".filters-list-item");
      if (!row) return;
      const index = Array.from(list.children).indexOf(row);
      if (index === -1) return;

      localState.filters.caseTypes.splice(index, 1);
      renderCaseTypes(container, localState);
      renderRelations(container, localState);
    });
  }
}

function attachCategoriesHandlers(container, localState) {
  const list = container.querySelector("[data-categories-list]");
  const addBtn = container.querySelector("[data-action='add-category']");

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      localState.filters.categories = localState.filters.categories || [];
      const idx = localState.filters.categories.length + 1;
      localState.filters.categories.push({
        id: "cat-" + idx,
        label: "Категория " + idx,
        order: idx
      });
      renderCategories(container, localState);
    });
  }

  if (list) {
    list.addEventListener("input", (event) => {
      const row = event.target.closest(".filters-list-item");
      if (!row) return;
      const index = Array.from(list.children).indexOf(row);
      if (index === -1) return;

      const cat = localState.filters.categories[index];
      if (!cat) return;

      const field = event.target.getAttribute("data-field");
      if (field === "category-id") {
        cat.id = event.target.value.trim();
      } else if (field === "category-label") {
        cat.label = event.target.value;
      } else if (field === "category-order") {
        const num = parseInt(event.target.value, 10);
        cat.order = isNaN(num) ? index + 1 : num;
      }
    });

    list.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-role='delete-category']");
      if (!btn) return;
      const row = btn.closest(".filters-list-item");
      if (!row) return;
      const index = Array.from(list.children).indexOf(row);
      if (index === -1) return;

      localState.filters.categories.splice(index, 1);
      renderCategories(container, localState);
    });
  }
}

function attachRelationsHandlers(container, localState) {
  const root = container.querySelector("[data-relations-root]");
  if (!root) return;

  root.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[data-role='toggle-relation']");
    if (!checkbox) return;

    const caseTypeId = checkbox.getAttribute("data-case-type-id");
    const lineId = checkbox.getAttribute("data-line-id");
    if (!caseTypeId || !lineId) return;

    const ct = (localState.filters.caseTypes || []).find(c => c.id === caseTypeId);
    if (!ct) return;

    ct.lines = Array.isArray(ct.lines) ? ct.lines : [];

    if (checkbox.checked) {
      if (!ct.lines.includes(lineId)) {
        ct.lines.push(lineId);
      }
    } else {
      ct.lines = ct.lines.filter(id => id !== lineId);
    }
  });
}

export default {
  name: "filters-editor",

  async init(container) {
    createLayout(container);

    const filtersJson = await ContentService.loadFilters();
    const localState = {
      filters: ensureStructure(deepClone(filtersJson))
    };

    renderLines(container, localState);
    renderCaseTypes(container, localState);
    renderCategories(container, localState);
    renderRelations(container, localState);

    attachLinesHandlers(container, localState);
    attachCaseTypesHandlers(container, localState);
    attachCategoriesHandlers(container, localState);
    attachRelationsHandlers(container, localState);

    const saveBtn = container.querySelector("[data-action='save-filters']");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        handleSaveFiltersRemote(localState, container);
      });
    }
  }
};


function showToast(message) {
  // простой fallback; потом можно заменить на общий UI-тостер
  alert(message);
}

async function handleSaveFiltersRemote(localState, container) {
  try {
    const result = await saveFilters(localState.filters, {
      sha: null
    });
    console.log("[FiltersEditor] save-filters result", result);
    showToast("filters.json сохранён в GitHub.");
    // при желании можно сохранить result.sha в meta, чтобы потом использовать для контроля версий
  } catch (err) {
    console.error("[FiltersEditor] save-filters error", err);
    showToast("Ошибка при сохранении filters.json: " + err.message);
  }
}
