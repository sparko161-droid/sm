// js/modules/constructor/main.js
//
// Версия с локальной моделью (редактирование в памяти) + интеграция с n8n для сохранения/удаления страниц.

import { AppState } from "/sm/js/core/state.js";
import ContentService from "/sm/js/core/contentService.js";
import { upsertPage, deletePage } from "/sm/js/api/constructorApi.js";

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj || null));
}

function createLayout(container) {
  container.innerHTML = `
    <section class="page page--constructor">
      <header class="page-header">
        <h1 class="page-title">Конструктор контента</h1>
        <p class="page-description">
          Локальный конструктор. Изменения выполняются в памяти браузера. 
          Сохранение/удаление страницы происходит через n8n → GitHub.
        </p>
      </header>

      <div class="constructor-grid">
        <div class="constructor-column" data-constructor-sections>
          <h2 class="constructor-column-title">Разделы</h2>
          <ul class="constructor-list" data-sections-list></ul>
        </div>

        <div class="constructor-column" data-constructor-pages>
          <h2 class="constructor-column-title">Страницы</h2>
          <ul class="constructor-list" data-pages-list></ul>
        </div>

        <div class="constructor-column" data-constructor-steps>
          <h2 class="constructor-column-title">Шаги страницы</h2>
          <ul class="constructor-list" data-steps-list></ul>
        </div>

        <div class="constructor-column" data-constructor-blocks>
          <h2 class="constructor-column-title">Блоки шага</h2>
          <ul class="constructor-list" data-blocks-list></ul>
        </div>
      </div>

      <footer class="page-footer constructor-footer">
        <div class="constructor-actions">
          <button type="button" class="btn btn--ghost" data-action="add">
            Добавить
          </button>
          <button type="button" class="btn btn--ghost" data-action="delete">
            Удалить
          </button>
          <button type="button" class="btn btn--ghost" data-action="move">
            Переместить вверх
          </button>
        </div>
        <div class="constructor-actions">
          <button type="button" class="btn btn--primary" data-action="save-page">
            Сохранить страницу в GitHub
          </button>
          <button type="button" class="btn btn--ghost" data-action="delete-page-remote">
            Удалить страницу из GitHub
          </button>
        </div>
        <p class="small text-muted">
          ⚠ Структура редактируется локально. При сохранении страница отправляется в n8n-хук,
          который обновляет файлы в репозитории через GitHub API.
        </p>
      </footer>
    </section>
  `;
}

function getSections(localState) {
  return (localState.sections && Array.isArray(localState.sections.sections))
    ? localState.sections.sections
    : [];
}

function getSectionById(localState, sectionId) {
  return getSections(localState).find((s) => s.id === sectionId) || null;
}

function getPageDraft(localState, pagePath) {
  if (!pagePath) return null;
  return localState.pages[pagePath] || null;
}

function setPageDraft(localState, pagePath, pageJson) {
  if (!pagePath) return;
  localState.pages[pagePath] = deepClone(pageJson || {});
}

function bindSections(container, localState) {
  const list = container.querySelector("[data-sections-list]");
  if (!list) return;

  const sections = getSections(localState);
  list.innerHTML = "";

  sections.forEach((section) => {
    const li = document.createElement("li");
    li.className = "constructor-list-item";
    li.dataset.sectionId = section.id;

    li.innerHTML = `
      <button type="button" class="constructor-list-button" data-role="select-section">
        <span class="constructor-list-title">${section.title}</span>
        <span class="constructor-list-meta">${section.id}</span>
      </button>
    `;

    if (localState.current.sectionId === section.id) {
      li.classList.add("is-active");
    }

    list.appendChild(li);
  });
}

function bindPages(container, localState) {
  const list = container.querySelector("[data-pages-list]");
  if (!list) return;
  list.innerHTML = "";

  const currentSection = getSectionById(localState, localState.current.sectionId);
  if (!currentSection || !Array.isArray(currentSection.pages)) return;

  currentSection.pages.forEach((page) => {
    const li = document.createElement("li");
    li.className = "constructor-list-item";
    li.dataset.pageId = page.id;
    li.dataset.pagePath = page.pagePath || "";

    li.innerHTML = `
      <button type="button" class="constructor-list-button" data-role="select-page">
        <span class="constructor-list-title">${page.title}</span>
        <span class="constructor-list-meta">${page.id}</span>
      </button>
    `;

    if (localState.current.pagePath === page.pagePath) {
      li.classList.add("is-active");
    }

    list.appendChild(li);
  });
}

function bindSteps(container, localState) {
  const list = container.querySelector("[data-steps-list]");
  if (!list) return;
  list.innerHTML = "";

  const pagePath = localState.current.pagePath;
  const pageDraft = getPageDraft(localState, pagePath);
  const steps = (pageDraft && Array.isArray(pageDraft.steps)) ? pageDraft.steps : [];

  steps.forEach((step, index) => {
    const li = document.createElement("li");
    li.className = "constructor-list-item";
    li.dataset.stepId = step.id || ("step-" + (index + 1));

    li.innerHTML = `
      <button type="button" class="constructor-list-button" data-role="select-step" data-step-index="${index}">
        <span class="constructor-list-title">${step.title || ("Шаг " + (index + 1))}</span>
        <span class="constructor-list-meta">${step.id || ("step-" + (index + 1))}</span>
      </button>
    `;

    if (localState.current.stepIndex === index) {
      li.classList.add("is-active");
    }

    list.appendChild(li);
  });
}

function bindBlocks(container, localState) {
  const list = container.querySelector("[data-blocks-list]");
  if (!list) return;
  list.innerHTML = "";

  const pagePath = localState.current.pagePath;
  const stepIndex = localState.current.stepIndex;
  const pageDraft = getPageDraft(localState, pagePath);
  const steps = (pageDraft && Array.isArray(pageDraft.steps)) ? pageDraft.steps : [];
  const step = steps[stepIndex];
  const blocks = (step && Array.isArray(step.blocks)) ? step.blocks : [];

  blocks.forEach((block, index) => {
    const li = document.createElement("li");
    li.className = "constructor-list-item";
    li.dataset.blockId = block.id || ("block-" + (index + 1));

    const type = block.type || "unknown";
    const title = (block.data && (block.data.title || block.data.label)) || "";
    const metaPieces = [type];
    if (block.id) metaPieces.push(block.id);
    const meta = metaPieces.join(" · ");

    li.innerHTML = `
      <div class="constructor-list-button constructor-list-button--static">
        <span class="constructor-list-title">${title || ("Блок " + (index + 1))}</span>
        <span class="constructor-list-meta">${meta}</span>
      </div>
    `;

    list.appendChild(li);
  });
}

function attachSelectionHandlers(container, localState) {
  const sectionsList = container.querySelector("[data-sections-list]");
  const pagesList = container.querySelector("[data-pages-list]");
  const stepsList = container.querySelector("[data-steps-list]");

  if (sectionsList) {
    sectionsList.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-role='select-section']");
      if (!btn) return;
      const li = btn.closest(".constructor-list-item");
      if (!li) return;

      const sectionId = li.dataset.sectionId;
      localState.current.sectionId = sectionId;
      localState.current.pagePath = null;
      localState.current.stepIndex = null;

      bindSections(container, localState);
      bindPages(container, localState);

      const stepsUl = container.querySelector("[data-steps-list]");
      const blocksUl = container.querySelector("[data-blocks-list]");
      if (stepsUl) stepsUl.innerHTML = "";
      if (blocksUl) blocksUl.innerHTML = "";
    });
  }

  if (pagesList) {
    pagesList.addEventListener("click", async (event) => {
      const btn = event.target.closest("[data-role='select-page']");
      if (!btn) return;
      const li = btn.closest(".constructor-list-item");
      if (!li) return;

      const pagePath = li.dataset.pagePath;
      if (!pagePath) return;

      localState.current.pagePath = pagePath;
      localState.current.stepIndex = null;

      if (!getPageDraft(localState, pagePath)) {
        const pageJson = await ContentService.loadPage(pagePath);
        if (pageJson) {
          setPageDraft(localState, pagePath, pageJson);
        }
      }

      bindPages(container, localState);
      bindSteps(container, localState);

      const blocksUl = container.querySelector("[data-blocks-list]");
      if (blocksUl) blocksUl.innerHTML = "";
    });
  }

  if (stepsList) {
    stepsList.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-role='select-step']");
      if (!btn) return;
      const li = btn.closest(".constructor-list-item");
      if (!li) return;

      const stepIndex = parseInt(btn.dataset.stepIndex, 10);
      localState.current.stepIndex = isNaN(stepIndex) ? null : stepIndex;

      bindSteps(container, localState);
      bindBlocks(container, localState);
    });
  }
}

function handleAdd(localState, container) {
  const current = localState.current;

  if (current.stepIndex != null && current.pagePath) {
    const pageDraft = getPageDraft(localState, current.pagePath);
    if (!pageDraft) return;
    pageDraft.steps = pageDraft.steps || [];
    const step = pageDraft.steps[current.stepIndex];
    if (!step) return;
    step.blocks = step.blocks || [];
    const newIndex = step.blocks.length + 1;
    step.blocks.push({
      id: "block-" + newIndex,
      type: "text",
      data: {
        title: "Новый блок " + newIndex,
        text: ""
      }
    });
    bindBlocks(container, localState);
    return;
  }

  if (current.pagePath) {
    const pageDraft = getPageDraft(localState, current.pagePath);
    if (!pageDraft) return;
    pageDraft.steps = pageDraft.steps || [];
    const newIndex = pageDraft.steps.length + 1;
    pageDraft.steps.push({
      id: "step-" + newIndex,
      title: "Новый шаг " + newIndex,
      description: "",
      blocks: []
    });
    localState.current.stepIndex = pageDraft.steps.length - 1;
    bindSteps(container, localState);
    bindBlocks(container, localState);
    return;
  }


  if (current.sectionId) {
    const section = getSectionById(localState, current.sectionId);
    if (!section) return;
    section.pages = section.pages || [];
    const newIndex = section.pages.length + 1;
    const newId = section.id + "-draft-" + newIndex;
    const newPagePath = `${section.id}/draft-${newIndex}.json`;
    section.pages.push({
      id: newId,
      slug: newId,
      title: "Новая страница " + newIndex,
      order: newIndex,
      pagePath: newPagePath
    });
    localState.current.pagePath = newPagePath;
    localState.current.stepIndex = null;
    bindPages(container, localState);

    // 🆕 сразу создаём пустой черновик страницы, чтобы её можно было сохранить в GitHub
    if (!getPageDraft(localState, newPagePath)) {
      setPageDraft(localState, newPagePath, {
        id: newId,
        sectionId: section.id,
        slug: newId,
        title: "Новая страница " + newIndex,
        description: "",
        steps: []
      });
    }

    const stepsUl = container.querySelector("[data-steps-list]");
    const blocksUl = container.querySelector("[data-blocks-list]");
    if (stepsUl) stepsUl.innerHTML = "";
    if (blocksUl) blocksUl.innerHTML = "";
    return;
  }

  const sections = getSections(localState);
  const newIndex = sections.length + 1;
  const newId = "section-draft-" + newIndex;
  sections.push({
    id: newId,
    slug: newId,
    title: "Новый раздел " + newIndex,
    order: newIndex,
    pages: []
  });
  localState.current.sectionId = newId;
  localState.current.pagePath = null;
  localState.current.stepIndex = null;
  bindSections(container, localState);

  const pagesUl = container.querySelector("[data-pages-list]");
  const stepsUl = container.querySelector("[data-steps-list]");
  const blocksUl = container.querySelector("[data-blocks-list]");
  if (pagesUl) pagesUl.innerHTML = "";
  if (stepsUl) stepsUl.innerHTML = "";
  if (blocksUl) blocksUl.innerHTML = "";
}

function handleDelete(localState, container) {
  const current = localState.current;

  if (current.stepIndex != null && current.pagePath) {
    const pageDraft = getPageDraft(localState, current.pagePath);
    if (!pageDraft || !Array.isArray(pageDraft.steps)) return;
    const step = pageDraft.steps[current.stepIndex];
    if (!step) return;
    step.blocks = step.blocks || [];
    if (step.blocks.length === 0) return;
    step.blocks.pop();
    bindBlocks(container, localState);
    return;
  }

  if (current.pagePath) {
    const section = getSectionById(localState, current.sectionId);
    if (!section || !Array.isArray(section.pages)) return;
    const idx = section.pages.findIndex((p) => p.pagePath === current.pagePath);
    if (idx === -1) return;
    section.pages.splice(idx, 1);
    localState.current.pagePath = null;
    localState.current.stepIndex = null;
    bindPages(container, localState);

    const stepsUl = container.querySelector("[data-steps-list]");
    const blocksUl = container.querySelector("[data-blocks-list]");
    if (stepsUl) stepsUl.innerHTML = "";
    if (blocksUl) blocksUl.innerHTML = "";
    return;
  }

  if (current.sectionId) {
    const sections = getSections(localState);
    const idx = sections.findIndex((s) => s.id === current.sectionId);
    if (idx === -1) return;
    sections.splice(idx, 1);
    localState.current.sectionId = null;
    localState.current.pagePath = null;
    localState.current.stepIndex = null;
    bindSections(container, localState);

    const pagesUl = container.querySelector("[data-pages-list]");
    const stepsUl = container.querySelector("[data-steps-list]");
    const blocksUl = container.querySelector("[data-blocks-list]");
    if (pagesUl) pagesUl.innerHTML = "";
    if (stepsUl) stepsUl.innerHTML = "";
    if (blocksUl) blocksUl.innerHTML = "";
  }
}

function handleMoveUp(localState, container) {
  const current = localState.current;

  if (current.stepIndex != null && current.pagePath) {
    const pageDraft = getPageDraft(localState, current.pagePath);
    if (!pageDraft || !Array.isArray(pageDraft.steps)) return;
    const idx = current.stepIndex;
    if (idx <= 0 || idx >= pageDraft.steps.length) return;
    const tmp = pageDraft.steps[idx - 1];
    pageDraft.steps[idx - 1] = pageDraft.steps[idx];
    pageDraft.steps[idx] = tmp;
    localState.current.stepIndex = idx - 1;
    bindSteps(container, localState);
    bindBlocks(container, localState);
    return;
  }

  if (current.pagePath) {
    const section = getSectionById(localState, current.sectionId);
    if (!section || !Array.isArray(section.pages)) return;
    const idx = section.pages.findIndex((p) => p.pagePath === current.pagePath);
    if (idx <= 0 || idx === -1) return;
    const tmp = section.pages[idx - 1];
    section.pages[idx - 1] = section.pages[idx];
    section.pages[idx] = tmp;
    bindPages(container, localState);
    return;
  }

  if (current.sectionId) {
    const sections = getSections(localState);
    const idx = sections.findIndex((s) => s.id === current.sectionId);
    if (idx <= 0 || idx === -1) return;
    const tmp = sections[idx - 1];
    sections[idx - 1] = sections[idx];
    sections[idx] = tmp;
    bindSections(container, localState);
  }
}

function showToast(message) {
  // простой fallback; в реальном UI можно заменить на нормальный toaster
  alert(message);
}

async function handleSavePageRemote(localState, container) {
  const pagePath = localState.current.pagePath;
  if (!pagePath) {
    showToast("Выберите страницу для сохранения.");
    return;
  }

  const pageDraft = getPageDraft(localState, pagePath);
  if (!pageDraft) {
    showToast("Для выбранной страницы нет черновика для сохранения.");
    return;
  }

  try {
    const result = await upsertPage(pagePath, pageDraft, {
      // sha можно будет прокинуть, если будем хранить его в localState/meta
      sha: null
    });

    showToast("Страница сохранена в GitHub.");

    // при желании можно сохранить новый sha в localState (result.sha)
    // и затем использовать его для delete/повторных upsert
  } catch (err) {
    console.error("[Constructor] save-page error", err);
    showToast("Ошибка при сохранении страницы: " + err.message);
  }
}

async function handleDeletePageRemote(localState, container) {
  const pagePath = localState.current.pagePath;
  if (!pagePath) {
    showToast("Выберите страницу для удаления.");
    return;
  }

  if (!window.confirm("Удалить страницу из GitHub? Это действие нельзя отменить.")) {
    return;
  }

  try {
    const result = await deletePage(pagePath, {
      // sha можно будет прокинуть, если будем хранить его в localState/meta
      sha: null
    });

    showToast("Страница удалена из GitHub.");

    // локально убираем страницу из структуры
    const section = getSectionById(localState, localState.current.sectionId);
    if (section && Array.isArray(section.pages)) {
      const idx = section.pages.findIndex((p) => p.pagePath === pagePath);
      if (idx !== -1) {
        section.pages.splice(idx, 1);
      }
    }
    delete localState.pages[pagePath];
    localState.current.pagePath = null;
    localState.current.stepIndex = null;

    bindPages(container, localState);
    const stepsUl = container.querySelector("[data-steps-list]");
    const blocksUl = container.querySelector("[data-blocks-list]");
    if (stepsUl) stepsUl.innerHTML = "";
    if (blocksUl) blocksUl.innerHTML = "";
  } catch (err) {
    console.error("[Constructor] delete-page-remote error", err);
    showToast("Ошибка при удалении страницы: " + err.message);
  }
}

function attachActionHandlers(container, localState) {
  const addBtn = container.querySelector("[data-action='add']");
  const deleteBtn = container.querySelector("[data-action='delete']");
  const moveBtn = container.querySelector("[data-action='move']");
  const savePageBtn = container.querySelector("[data-action='save-page']");
  const deletePageRemoteBtn = container.querySelector("[data-action='delete-page-remote']");

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      handleAdd(localState, container);
    });
  }
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      handleDelete(localState, container);
    });
  }
  if (moveBtn) {
    moveBtn.addEventListener("click", () => {
      handleMoveUp(localState, container);
    });
  }
  if (savePageBtn) {
    savePageBtn.addEventListener("click", () => {
      handleSavePageRemote(localState, container);
    });
  }
  if (deletePageRemoteBtn) {
    deletePageRemoteBtn.addEventListener("click", () => {
      handleDeletePageRemote(localState, container);
    });
  }
}

export default {
  name: "constructor",

  async init(container) {
    createLayout(container);

    if (!AppState.sections) {
      await ContentService.loadSections();
    }

    const localState = {
      sections: deepClone(AppState.sections || { sections: [] }),
      pages: {},
      current: {
        sectionId: null,
        pagePath: null,
        stepIndex: null
      }
    };

    bindSections(container, localState);
    attachSelectionHandlers(container, localState);
    attachActionHandlers(container, localState);
  }
};
