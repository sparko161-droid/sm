import { initL1Calculator } from "/sm/js/calculators/l1.js";
import { initL2Calculator } from "/sm/js/calculators/l2.js";
import { initImplementationCalculator } from "/sm/js/calculators/implementation.js";
import { initSalesHunterCalculator, initSalesClientCalculator } from "/sm/js/calculators/sales.js";
import { L1_CALC_TEMPLATE, L2_CALC_TEMPLATE, IMPL_CALC_TEMPLATE, SALES_H_CALC_TEMPLATE, SALES_C_CALC_TEMPLATE } from "/sm/js/modules/calculators/templates.js";

const CalculatorsPage = {
  name: "calculators",

  async init(container) {
    container.innerHTML = `
      <section class="section section--calculators">
        <header class="section-header">
          <h2>📊 Калькуляторы мотивации</h2>
          <p class="tagline">
            Общий раздел с калькуляторами для поддержки, внедрения и отдела продаж.
            Каждый калькулятор полностью повторяет логику и оформление из своего раздела.
          </p>
        </header>

        <div class="card-grid calculators-grid">
          <article class="card card--clickable" data-calc-open="l1">
            <div class="card-title">L1 · Инженер поддержки</div>
            <p class="small">
              Оклад + премии за закрытие и создание с учётом пропущенных обращений и просрочек SLA.
            </p>
          </article>

          <article class="card card--clickable" data-calc-open="l2">
            <div class="card-title">L2 · Инженер выездной / проектный</div>
            <p class="small">
              Оклад, город, закрытые тикеты, выезды, терминалы, доп. работы и командные показатели.
            </p>
          </article>

          <article class="card card--clickable" data-calc-open="impl">
            <div class="card-title">Инженер внедрения</div>
            <p class="small">
              Оклад + факт нормо-часов × ставка × личный коэффициент × командный коэффициент.
            </p>
          </article>

          <article class="card card--clickable" data-calc-open="sales-h">
            <div class="card-title">Хантер (отдел продаж)</div>
            <p class="small">
              Оклад, маржа, клауд и коэффициенты (ЛК, КК, КСБ). Расчет ZP хантера.
            </p>
          </article>

          <article class="card card--clickable" data-calc-open="sales-c">
            <div class="card-title">Клиентский отдел</div>
            <p class="small">
              Оклад, портфель, клауд и коэффициенты для аккаунт-менеджера.
            </p>
          </article>
        </div>
      </section>

      <div class="calc-backdrop" data-calc-backdrop hidden>
        <div class="calc-dialog">
          <button class="calc-close" type="button" data-calc-close aria-label="Закрыть калькулятор">×</button>
          <div class="calc-dialog-body" data-calc-body></div>
        </div>
      </div>
    `;

    const backdrop = container.querySelector("[data-calc-backdrop]");
    const bodyEl = container.querySelector("[data-calc-body]");
    const closeBtn = container.querySelector("[data-calc-close]");

    if (!backdrop || !bodyEl || !closeBtn) return;

    const open = (type) => {
      let tpl = "";
      bodyEl.innerHTML = "";

      switch (type) {
        case "l1":
          tpl = L1_CALC_TEMPLATE;
          bodyEl.innerHTML = tpl;
          initL1Calculator(bodyEl);
          break;
        case "l2":
          tpl = L2_CALC_TEMPLATE;
          bodyEl.innerHTML = tpl;
          initL2Calculator(bodyEl);
          break;
        case "impl":
          tpl = IMPL_CALC_TEMPLATE;
          bodyEl.innerHTML = tpl;
          initImplementationCalculator(bodyEl);
          break;
        case "sales-h":
          tpl = SALES_H_CALC_TEMPLATE;
          bodyEl.innerHTML = tpl;
          initSalesHunterCalculator(bodyEl);
          break;
        case "sales-c":
          tpl = SALES_C_CALC_TEMPLATE;
          bodyEl.innerHTML = tpl;
          initSalesClientCalculator(bodyEl);
          break;
        default:
          return;
      }

      backdrop.hidden = false;
      requestAnimationFrame(() => {
        backdrop.classList.add("is-open");
      });
    };

    const close = () => {
      backdrop.classList.remove("is-open");
      setTimeout(() => {
        backdrop.hidden = true;
        bodyEl.innerHTML = "";
      }, 150);
    };

    container.addEventListener("click", (event) => {
      const card = event.target.closest("[data-calc-open]");
      if (card) {
        const type = card.getAttribute("data-calc-open");
        open(type);
        return;
      }

      if (event.target === backdrop || event.target.closest("[data-calc-close]")) {
        close();
      }
    });
  },

  destroy() {}
};

export default CalculatorsPage;
