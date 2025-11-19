
import { initL1Calculator } from "/sm/js/calculators/l1.js";
import { initL2Calculator } from "/sm/js/calculators/l2.js";
import { initImplementationCalculator } from "/sm/js/calculators/implementation.js";
import { initSalesHunterCalculator, initSalesClientCalculator } from "/sm/js/calculators/sales.js";

const CalculatorsPage = {
  name: "calculators",

  async init(container) {
    container.innerHTML = `
      <section class="section section--calculators">
        <header class="section-header">
          <h2>📊 Калькуляторы мотивации</h2>
          <p class="tagline">
            Общий раздел с калькуляторами для поддержки, внедрения и отдела продаж.
            Логика расчета единая, UI и формулы синхронизированы с разделами Support, Implementation и Sales.
          </p>
        </header>

        <div class="card-grid calculators-grid">
          <article class="card" data-calc-l1-block>
            <div class="card-title">L1 · Инженер поддержки</div>
            <p class="small">
              Расчет оклада и премии для L1 с учетом выполненных обращений, пропусков и просрочек.
            </p>
            <div data-role="l1-calculator-host"></div>
          </article>

          <article class="card" data-calc-l2-block>
            <div class="card-title">L2 · Инженер выездной / проектный</div>
            <p class="small">
              Расчет мотивации L2 с учетом выездов, терминалов и НДФЛ.
            </p>
            <div data-role="l2-calculator-host"></div>
          </article>

          <article class="card" data-calc-impl-block>
            <div class="card-title">Инженер внедрения</div>
            <p class="small">
              Калькулятор для инженеров внедрения: факт нормо-часов × ставка × личный коэффициент.
              НДФЛ удерживается только с окладной части.
            </p>
            <div data-role="impl-calculator-host"></div>
          </article>

          <article class="card" data-calc-sales-h-block>
            <div class="card-title">Хантер (коммерческий отдел)</div>
            <p class="small">
              Расчет мотивации хантера по марже, клауду, коэффициентам ЛК / КК / КСБ и дополнительным премиям.
            </p>
            <div data-role="sales-h-calculator-host"></div>
          </article>

          <article class="card" data-calc-sales-c-block>
            <div class="card-title">Клиентский отдел (аккаунт)</div>
            <p class="small">
              Калькулятор для аккаунт-менеджеров: маржа, облачные сервисы и премии с учетом НДФЛ.
            </p>
            <div data-role="sales-c-calculator-host"></div>
          </article>
        </div>

        <p class="small calculators-note">
          Все калькуляторы используют общий модуль <code>js/calculators/core.js</code>:
          <strong>formatMoney</strong>, <strong>parseNumber</strong>, <strong>NDFL_RATE</strong> и
          <strong>attachAutoRecalc</strong> для единообразного поведения во всех разделах.
        </p>
      </section>
    `;

    const l1Host = container.querySelector("[data-role='l1-calculator-host']");
    const l2Host = container.querySelector("[data-role='l2-calculator-host']");
    const implHost = container.querySelector("[data-role='impl-calculator-host']");
    const salesHHost = container.querySelector("[data-role='sales-h-calculator-host']");
    const salesCHost = container.querySelector("[data-role='sales-c-calculator-host']");

    try {
      if (l1Host) {
        // L1 калькулятор уже умеет искать свои поля внутри контейнера,
        // поэтому просто передаем card как корень.
        initL1Calculator(l1Host);
      }
    } catch (e) {
      console.warn("[Calculators] L1 init failed", e);
    }

    try {
      if (l2Host) {
        initL2Calculator(l2Host);
      }
    } catch (e) {
      console.warn("[Calculators] L2 init failed", e);
    }

    try {
      if (implHost) {
        initImplementationCalculator(implHost);
      }
    } catch (e) {
      console.warn("[Calculators] Implementation calculator init failed", e);
    }

    try {
      if (salesHHost) {
        initSalesHunterCalculator(salesHHost);
      }
    } catch (e) {
      console.warn("[Calculators] Sales hunter calculator init failed", e);
    }

    try {
      if (salesCHost) {
        initSalesClientCalculator(salesCHost);
      }
    } catch (e) {
      console.warn("[Calculators] Sales client calculator init failed", e);
    }
  },

  destroy() {}
};

export default CalculatorsPage;
