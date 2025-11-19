
import { initL1Calculator } from "/sm/js/calculators/l1.js";
import { initL2Calculator } from "/sm/js/calculators/l2.js";
import { initImplementationCalculator } from "/sm/js/calculators/implementation.js";
import { initSalesHunterCalculator, initSalesClientCalculator } from "/sm/js/calculators/sales.js";

function renderCalculator(type, bodyEl) {
  if (!bodyEl) return;

  if (type === "l1") {
    bodyEl.innerHTML = `
      <div class="calc-grid">
        <div class="calc-card" data-calc-l1>
          <div class="calc-title">L1 — калькулятор зарплаты</div>
          <div class="calc-sub">
            Оклад + премии за закрытие и создание с учётом пропущенных звонков и просрочек.
            Ниже показано, как меняется ставка и итоговая ЗП при разных показателях.
          </div>

          <div class="calc-two-col">
            <div class="calc-panel calc-panel-inputs">
              <div class="calc-row">
                <label class="calc-label" for="l1-grade">Грейд:</label>
                <select id="l1-grade" class="calc-select" name="grade">
                  <option value="1">1 грейд (оклад 23 000)</option>
                  <option value="2">2 грейд (оклад 29 000)</option>
                  <option value="3">3 грейд (оклад 32 000)</option>
                </select>
              </div>

              <div class="calc-row">
                <label class="calc-label" for="l1-resolved">Закрытых заявок за месяц:</label>
                <input id="l1-resolved" class="calc-input" type="number" min="0" value="100" inputmode="numeric" />
              </div>

              <div class="calc-row">
                <label class="calc-label" for="l1-created">Созданных заявок за месяц:</label>
                <input id="l1-created" class="calc-input" type="number" min="0" value="300" inputmode="numeric" />
              </div>

              <div class="calc-row">
                <label class="calc-label" for="l1-missed">% пропущенных звонков:</label>
                <input id="l1-missed" class="calc-input" type="number" min="0" step="0.1" value="1.0" inputmode="decimal" />
              </div>

              <div class="calc-row">
                <label class="calc-label" for="l1-overdue">% просроченных задач (для 3 грейда):</label>
                <input id="l1-overdue" class="calc-input" type="number" min="0" step="0.1" value="1.0" inputmode="decimal" />
              </div>

              <button class="calc-btn" type="button" data-action="recalc-l1">Пересчитать L1</button>
            </div>

            <div class="calc-panel calc-panel-results">
              <div class="calc-results">
                <div class="calc-result-highlight">
                  <div class="calc-highlight-label">Итого после НДФЛ</div>
                  <div class="calc-highlight-value" data-output="l1-total-net">—</div>
                </div>

                <div class="calc-divider"></div>

                <div class="calc-result-line">
                  <div>
                    <div class="calc-label">После НДФЛ</div>
                    <div class="calc-hint">Оклад минус НДФЛ + премии</div>
                  </div>
                  <div class="calc-value" data-output="l1-total-net">—</div>
                </div>

                <div class="calc-result-line">
                  <div>
                    <div class="calc-label">До вычета</div>
                    <div class="calc-hint">Оклад + премии</div>
                  </div>
                  <div class="calc-value" data-output="l1-total-gross">—</div>
                </div>

                <div class="calc-divider"></div>
              </div>

              <div id="l1-result" class="calc-result" data-output="l1-result"></div>
              <div id="l1-breakdown" class="rate-breakdown" data-output="l1-breakdown"></div>
              <div class="calc-note">
                Подробная расшифровка показывает, сколько рублей даёт каждая единица закрытий и созданий.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    initL1Calculator(bodyEl);
    return;
  }

  if (type === "l2") {
    bodyEl.innerHTML = `
      <div class="calc-grid">
        <div class="calc-card" data-calc-l2>
          <div class="calc-title">L2 — калькулятор зарплаты</div>
          <div class="calc-sub">
            Оклад + мотивация за выезды, терминалы и другие проектные работы.
            НДФЛ удерживается только с оклада, премии считаются «чистыми».
          </div>

          <div class="calc-two-col">
            <div class="calc-panel calc-panel-inputs">
              <div class="calc-row">
                <label class="calc-label" for="l2-grade">Грейд:</label>
                <select id="l2-grade" class="calc-select" name="grade">
                  <option value="2">L2 — базовый</option>
                  <option value="3">L3 — старший</option>
                </select>
              </div>

              <div class="calc-row">
                <label class="calc-label" for="l2-visits">Выездов за месяц:</label>
                <input id="l2-visits" class="calc-input" type="number" min="0" value="10" inputmode="numeric" />
              </div>

              <div class="calc-row">
                <label class="calc-label" for="l2-terminals">Терминалов в работе:</label>
                <input id="l2-terminals" class="calc-input" type="number" min="0" value="20" inputmode="numeric" />
              </div>

              <button class="calc-btn" type="button" data-action="recalc-l2">Пересчитать L2</button>
            </div>

            <div class="calc-panel calc-panel-results">
              <div class="calc-results">
                <div class="calc-result-highlight">
                  <div class="calc-highlight-label">Итого после НДФЛ</div>
                  <div class="calc-highlight-value" data-output="l2-total-net">—</div>
                </div>

                <div class="calc-divider"></div>

                <div class="calc-result-line">
                  <div>
                    <div class="calc-label">После НДФЛ</div>
                    <div class="calc-hint">Оклад минус НДФЛ + премии</div>
                  </div>
                  <div class="calc-value" data-output="l2-total-net">—</div>
                </div>

                <div class="calc-result-line">
                  <div>
                    <div class="calc-label">До вычета</div>
                    <div class="calc-hint">Оклад + премии</div>
                  </div>
                  <div class="calc-value" data-output="l2-total-gross">—</div>
                </div>

                <div class="calc-divider"></div>
              </div>

              <div class="calc-result" data-output="l2-result"></div>
              <div class="rate-breakdown" data-output="l2-breakdown"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    initL2Calculator(bodyEl);
    return;
  }

  if (type === "impl") {
    bodyEl.innerHTML = `
      <div class="calc-grid">
        <div class="calc-card" data-calc-impl>
          <div class="calc-title">ОВ — калькулятор зарплаты</div>
          <div class="calc-sub">
            Оклад + норма-часы × ставка × личный коэф. × командный коэф.
            НДФЛ удерживается только с окладной части.
          </div>

          <div class="calc-two-col">
            <div class="calc-panel calc-panel-inputs">
              <div class="calc-row">
                <label class="calc-label" for="impl-grade">Уровень сотрудника:</label>
                <select id="impl-grade" class="calc-select" name="grade">
                  <option value="1i">Специалист 1-го уровня (исп. срок) — план 80 нч, 100 ₽/ч, оклад 30 000 ₽</option>
                  <option value="1">Специалист 1-го уровня — план 100 нч, 100 ₽/ч, оклад 30 000 ₽</option>
                  <option value="2">Специалист 2-го уровня — план 120 нч, 140 ₽/ч, оклад 35 000 ₽</option>
                  <option value="3">Специалист 3-го уровня — план 150 нч, 170 ₽/ч, оклад 38 000 ₽</option>
                  <option value="4">Специалист 4-го уровня — план 180 нч, 200 ₽/ч, оклад 43 000 ₽</option>
                </select>
              </div>

              <div class="calc-row">
                <label class="calc-label" for="impl-hours">Фактически отработано нормо-часов:</label>
                <input id="impl-hours" class="calc-input" type="number" min="0" step="1" value="100" />
              </div>

              <div class="calc-row">
                <label class="calc-label" for="impl-team-hours">Норма-часы всего отдела за месяц:</label>
                <input id="impl-team-hours" class="calc-input" type="number" min="0" step="1" value="400" />
              </div>

              <div class="calc-row">
                <label class="calc-label" for="impl-lk">Личный коэфф. (ЛК):</label>
                <input id="impl-lk" class="calc-input" type="number" min="0" step="0.01" value="1.0" />
              </div>

              <div class="calc-row">
                <label class="calc-label" for="impl-kk">Командный коэфф. (КК):</label>
                <input id="impl-kk" class="calc-input" type="number" min="0" step="0.01" value="1.0" />
              </div>

              <button class="calc-btn" type="button" data-action="recalc-impl">Пересчитать ОВ</button>
            </div>

            <div class="calc-panel calc-panel-results">
              <div class="calc-results">
                <div class="calc-result-highlight">
                  <div class="calc-highlight-label">Итого после НДФЛ</div>
                  <div class="calc-highlight-value" data-output="impl-total-net">—</div>
                </div>

                <div class="calc-divider"></div>

                <div class="calc-result-line">
                  <div>
                    <div class="calc-label">После НДФЛ</div>
                    <div class="calc-hint">Оклад минус НДФЛ + премия за нормо-часы</div>
                  </div>
                  <div class="calc-value" data-output="impl-total-net">—</div>
                </div>

                <div class="calc-result-line">
                  <div>
                    <div class="calc-label">До вычета</div>
                    <div class="calc-hint">Оклад + премия</div>
                  </div>
                  <div class="calc-value" data-output="impl-total-gross">—</div>
                </div>

                <div class="calc-divider"></div>
              </div>

              <div class="calc-result" data-output="impl-result"></div>
              <div class="rate-breakdown" data-output="impl-breakdown"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    initImplementationCalculator(bodyEl);
    return;
  }

  if (type === "sales-h") {
    bodyEl.innerHTML = `
      <article class="card" data-calc-sales-hunter>
        <div class="card-title">Калькулятор ZP хантера</div>
        <p class="small">
          Оклад + % с маржи и клауда с учетом личного, командного и коэффициента сбора.
          НДФЛ удерживается только с окладной части.
        </p>
        <div class="grid">
          <div>
            <h4 class="small">Входные данные</h4>
            <div class="calc-row">
              <label class="calc-label" for="sales-h-salary">Оклад (₽):</label>
              <input id="sales-h-salary" type="number" class="calc-input" value="50000" min="0" step="1000" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-h-margin">Маржа за период (₽):</label>
              <input id="sales-h-margin" type="number" class="calc-input" value="300000" min="0" step="1000" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-h-margin-pct">% с маржи:</label>
              <input id="sales-h-margin-pct" type="number" class="calc-input" value="5" min="0" max="100" step="0.1" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-h-cloud">Клауд-доход (₽):</label>
              <input id="sales-h-cloud" type="number" class="calc-input" value="50000" min="0" step="1000" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-h-cloud-pct">% с клауда:</label>
              <input id="sales-h-cloud-pct" type="number" class="calc-input" value="5" min="0" max="100" step="0.1" />
            </div>

            <div class="calc-row">
              <label class="calc-label" for="sales-h-lk">Личный коэфф. (ЛК):</label>
              <input id="sales-h-lk" type="number" class="calc-input" value="1" step="0.01" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-h-kk">Командный коэфф. (КК):</label>
              <input id="sales-h-kk" type="number" class="calc-input" value="1" step="0.01" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-h-ksb">Коэфф. сбора (КСБ):</label>
              <input id="sales-h-ksb" type="number" class="calc-input" value="1" step="0.01" />
            </div>

            <div class="calc-row">
              <label class="calc-label" for="sales-h-loya">Премия LOYA (₽):</label>
              <input id="sales-h-loya" type="number" class="calc-input" value="0" min="0" step="1000" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-h-resto">Премия RestoPNL (₽):</label>
              <input id="sales-h-resto" type="number" class="calc-input" value="0" min="0" step="1000" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-h-other">Другие премии (₽):</label>
              <input id="sales-h-other" type="number" class="calc-input" value="0" min="0" step="1000" />
            </div>
          </div>

          <div>
            <h4 class="small">Результат</h4>
            <p class="calc-result-highlight" data-output="sales-h-main">
              Заполните данные, чтобы увидеть расчёт.
            </p>
            <div class="calc-result-details" data-output="sales-h-details"></div>
          </div>
        </div>
      </article>
    `;
    initSalesHunterCalculator(bodyEl);
    return;
  }

  if (type === "sales-c") {
    bodyEl.innerHTML = `
      <article class="card" data-calc-sales-client>
        <div class="card-title">Калькулятор ZP аккаунт-менеджера</div>
        <p class="small">
          Оклад + % с маржи и клауда по действующим клиентам, плюс дополнительные премии.
          НДФЛ удерживается только с окладной части.
        </p>
        <div class="grid">
          <div>
            <h4 class="small">Входные данные</h4>
            <div class="calc-row">
              <label class="calc-label" for="sales-c-salary">Оклад (₽):</label>
              <input id="sales-c-salary" type="number" class="calc-input" value="45000" min="0" step="1000" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-c-margin">Маржа за период (₽):</label>
              <input id="sales-c-margin" type="number" class="calc-input" value="250000" min="0" step="1000" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-c-margin-pct">% с маржи:</label>
              <input id="sales-c-margin-pct" type="number" class="calc-input" value="3" min="0" max="100" step="0.1" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-c-cloud">Клауд-доход (₽):</label>
              <input id="sales-c-cloud" type="number" class="calc-input" value="40000" min="0" step="1000" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-c-cloud-pct">% с клауда:</label>
              <input id="sales-c-cloud-pct" type="number" class="calc-input" value="3" min="0" max="100" step="0.1" />
            </div>

            <div class="calc-row">
              <label class="calc-label" for="sales-c-lk">Личный коэфф. (ЛК):</label>
              <input id="sales-c-lk" type="number" class="calc-input" value="1" step="0.01" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-c-kk">Командный коэфф. (КК):</label>
              <input id="sales-c-kk" type="number" class="calc-input" value="1" step="0.01" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-c-ksb">Коэфф. сбора (КСБ):</label>
              <input id="sales-c-ksb" type="number" class="calc-input" value="1" step="0.01" />
            </div>

            <div class="calc-row">
              <label class="calc-label" for="sales-c-loya">Премия LOYA (₽):</label>
              <input id="sales-c-loya" type="number" class="calc-input" value="0" min="0" step="1000" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-c-resto">Премия RestoPNL (₽):</label>
              <input id="sales-c-resto" type="number" class="calc-input" value="0" min="0" step="1000" />
            </div>
            <div class="calc-row">
              <label class="calc-label" for="sales-c-other">Другие премии (₽):</label>
              <input id="sales-c-other" type="number" class="calc-input" value="0" min="0" step="1000" />
            </div>
          </div>

          <div>
            <h4 class="small">Результат</h4>
            <p class="calc-result-highlight" data-output="sales-c-main">
              Заполните данные, чтобы увидеть расчёт.
            </p>
            <div class="calc-result-details" data-output="sales-c-details"></div>
          </div>
        </div>
      </article>
    `;
    initSalesClientCalculator(bodyEl);
  }
}

const CalculatorsPage = {
  name: "calculators",

  async init(container) {
    container.innerHTML = `
      <section class="section section--calculators">
        <header class="section-header">
          <h2>📊 Калькуляторы мотивации</h2>
          <p class="tagline">
            Общий раздел с калькуляторами для поддержки, внедрения и отдела продаж.
            При клике на карточку открывается попап с полным расчётом и расшифровкой формул.
          </p>
        </header>

        <div class="card-grid calculators-grid">
          <article class="card card--clickable" data-calc-type="l1">
            <div class="card-title">L1 · Инженер поддержки</div>
            <p class="small">
              Расчет оклада и премии для L1 с учетом выполненных обращений, пропусков и просрочек.
              Наглядно показывает, как меняется ставка и итоговая ЗП.
            </p>
          </article>

          <article class="card card--clickable" data-calc-type="l2">
            <div class="card-title">L2 · Инженер выездной / проектный</div>
            <p class="small">
              Мотивация за выезды, терминалы и проектные работы с учётом НДФЛ по окладу.
            </p>
          </article>

          <article class="card card--clickable" data-calc-type="impl">
            <div class="card-title">Инженер внедрения</div>
            <p class="small">
              Оклад + норма-часы × ставка × коэффициенты. Показывает вклад личного и командного плана.
            </p>
          </article>

          <article class="card card--clickable" data-calc-type="sales-h">
            <div class="card-title">Хантер (коммерческий отдел)</div>
            <p class="small">
              Расчёт мотивации хантера по марже, клауду, коэффициентам ЛК / КК / КСБ и дополнительным премиям.
            </p>
          </article>

          <article class="card card--clickable" data-calc-type="sales-c">
            <div class="card-title">Клиентский отдел (аккаунт)</div>
            <p class="small">
              Калькулятор для аккаунт-менеджеров: маржа, облачные сервисы и премии с учетом НДФЛ.
            </p>
          </article>
        </div>

        <div class="calc-backdrop" data-calc-popup hidden>
          <div class="calc-dialog">
            <button class="calc-close" type="button" data-calc-popup-close aria-label="Закрыть калькулятор">×</button>
            <div class="calc-dialog-body" data-calc-popup-body></div>
          </div>
        </div>
      </section>
    `;

    const popup = container.querySelector("[data-calc-popup]");
    const popupBody = container.querySelector("[data-calc-popup-body]");
    const popupClose = container.querySelector("[data-calc-popup-close]");

    const openPopup = (type) => {
      if (!popup || !popupBody) return;
      popup.removeAttribute("hidden");
      popup.classList.add("is-open");
      popupBody.innerHTML = "";
      renderCalculator(type, popupBody);
    };

    const closePopup = () => {
      if (!popup || !popupBody) return;
      popup.classList.remove("is-open");
      popup.setAttribute("hidden", "hidden");
      popupBody.innerHTML = "";
    };

    if (popupClose) {
      popupClose.addEventListener("click", () => {
        closePopup();
      });
    }
    if (popup) {
      popup.addEventListener("click", (e) => {
        if (e.target === popup) {
          closePopup();
        }
      });
    }

    container
      .querySelectorAll("[data-calc-type]")
      .forEach((card) => {
        card.addEventListener("click", () => {
          const type = card.getAttribute("data-calc-type");
          if (!type) return;
          openPopup(type);
        });
      });
  },

  destroy() {}
};

export default CalculatorsPage;
