import { AppState } from "/sm/js/core/state.js";

/**
 * StepRenderer
 *
 * Универсальный компонент для отображения страниц в формате:
 * page -> steps[] -> blocks[]
 *
 * На этом этапе компонент отвечает только за:
 * - отображение заголовка страницы;
 * - отображение текущего шага;
 * - навигацию "назад/далее" по шагам;
 * - простую полосу прогресса.
 *
 * Отрисовка самих блоков будет вынесена в BlocksRenderer (Шаг 3.2).
 */

export class StepRenderer {
  constructor(container, pageJson) {
    this.container = container;
    this.page = pageJson;
    this.currentIndex = 0;

    if (!this.page || !Array.isArray(this.page.steps)) {
      console.warn("[StepRenderer] page.steps is not an array", this.page);
      this.page = { ...this.page, steps: [] };
    }

    this.handleNext = this.handleNext.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
  }

  init() {
    this.render();
    this.attachEvents();
  }

  destroy() {
    if (!this.container) return;
    this.container.innerHTML = "";
  }

  get steps() {
    return this.page.steps || [];
  }

  handleNext() {
    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex += 1;
      this.updateStepView();
    }
  }

  handlePrev() {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      this.updateStepView();
    }
  }

  render() {
    if (!this.container) return;

    const stepsCount = this.steps.length;
    const hasSteps = stepsCount > 0;

    this.container.innerHTML = `
      <section class="page page--step">
        <header class="page-header">
          <h1 class="page-title">${this.escape(this.page.title || "")}</h1>
          ${this.page.description ? `<p class="page-description">${this.escape(this.page.description)}</p>` : ""}
        </header>

        <div class="page-progress" data-step-progress hidden>
          <div class="page-progress-bar" data-step-progress-bar></div>
          <div class="page-progress-label" data-step-progress-label></div>
        </div>

        <div class="page-step-body" data-step-body>
          ${hasSteps ? "" : "<p>Для этой страницы пока нет шагов.</p>"}
        </div>

        <footer class="page-footer" data-step-footer>
          <button type="button" class="btn btn--ghost" data-step-prev disabled>Назад</button>
          <button type="button" class="btn btn--primary" data-step-next ${!hasSteps ? "disabled" : ""}>Далее</button>
        </footer>
      </section>
    `;

    if (hasSteps) {
      this.updateStepView();
    }
  }

  updateStepView() {
    const steps = this.steps;
    const body = this.container.querySelector("[data-step-body]");
    const progress = this.container.querySelector("[data-step-progress]");
    const progressBar = this.container.querySelector("[data-step-progress-bar]");
    const progressLabel = this.container.querySelector("[data-step-progress-label]");
    const prevBtn = this.container.querySelector("[data-step-prev]");
    const nextBtn = this.container.querySelector("[data-step-next]");

    if (!body) return;

    const step = steps[this.currentIndex];
    if (!step) {
      body.innerHTML = "<p>Шаг не найден.</p>";
      return;
    }

    const total = steps.length;
    const current = this.currentIndex + 1;
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;

    if (progress && progressBar && progressLabel) {
      progress.hidden = total <= 1;
      progressBar.style.width = percent + "%";
      progressLabel.textContent = `${current} / ${total}`;
    }

    // На этом шаге мы не рендерим blocks подробно — только заголовок и описание шага.
    body.innerHTML = `
      <article class="page-step">
        <h2 class="page-step-title">${this.escape(step.title || `Шаг ${current}`)}</h2>
        ${step.description ? `<p class="page-step-description">${this.escape(step.description)}</p>` : ""}
        <div class="page-step-blocks" data-step-blocks>
          <!-- BlocksRenderer подключим на шаге 3.2 -->
        </div>
      </article>
    `;

    if (prevBtn) {
      prevBtn.disabled = this.currentIndex === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = this.currentIndex >= total - 1;
      nextBtn.textContent = this.currentIndex >= total - 1 ? "Готово" : "Далее";
    }
  }

  attachEvents() {
    const prevBtn = this.container.querySelector("[data-step-prev]");
    const nextBtn = this.container.querySelector("[data-step-next]");

    if (prevBtn) {
      prevBtn.addEventListener("click", this.handlePrev);
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", this.handleNext);
    }
  }

  escape(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}

export default StepRenderer;
