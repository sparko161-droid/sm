import { authCalc } from "/sm/js/api/calcAuthApi.js";
import { initL1Calculator } from "/sm/js/calculators/l1.js";
import { initL2Calculator } from "/sm/js/calculators/l2.js";
import { initImplementationCalculator } from "/sm/js/calculators/implementation.js";
import { initSalesHunterCalculator, initSalesClientCalculator } from "/sm/js/calculators/sales.js";
import { L1_CALC_TEMPLATE, L2_CALC_TEMPLATE, IMPL_CALC_TEMPLATE, SALES_H_CALC_TEMPLATE, SALES_C_CALC_TEMPLATE } from "/sm/js/modules/calculators/templates.js";


function setupCalculatorsAuthGate(container) {
  const globalKey = "sm_calc_access_allowed";

  const hasSessionStorage =
    typeof window !== "undefined" &&
    typeof window.sessionStorage !== "undefined";

  let alreadyAllowed = false;
  if (hasSessionStorage) {
    try {
      alreadyAllowed = window.sessionStorage.getItem(globalKey) === "1";
    } catch (e) {
      alreadyAllowed = false;
    }
  }

  if (alreadyAllowed) {
    return; // уже есть доступ, попап не показываем
  }

  const overlay = document.createElement("div");
  overlay.className = "calc-auth-overlay";
  overlay.setAttribute("data-calc-auth-overlay", "true");
  overlay.innerHTML = `
    <div class="calc-auth-dialog">
      <h2 class="calc-auth-title">Доступ к калькуляторам</h2>
      <p class="calc-auth-text">
        Для доступа к разделу калькуляторов введите пароль. 
        Пароль проверяется через защищённый n8n-хук, в браузере он не сохраняется.
      </p>
      <form class="calc-auth-form" data-calc-auth-form>
        <label class="form-field">
          <span class="form-label">Пароль</span>
          <input 
            type="password" 
            name="password" 
            class="input"
            autocomplete="off"
            required
          />
        </label>
        <button type="submit" class="btn btn--primary">
          Войти
        </button>
      </form>
      <div class="calc-auth-status" data-calc-auth-status></div>
    </div>
  `;

  // Делаем оверлей полноэкранным и некликабельным "сквозь"
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "9999"
  });

  const dialog = overlay.querySelector(".calc-auth-dialog");
  if (dialog) {
    Object.assign(dialog.style, {
      maxWidth: "480px",
      width: "100%",
      backgroundColor: "#111827",
      borderRadius: "16px",
      padding: "24px 24px 20px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.6)"
    });
  }

  const statusEl = overlay.querySelector("[data-calc-auth-status]");
  const form = overlay.querySelector("[data-calc-auth-form]");

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const password = String(formData.get("password") || "").trim();

      if (!password) {
        if (statusEl) statusEl.textContent = "Введите пароль.";
        return;
      }

      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;
      if (statusEl) statusEl.textContent = "Проверяем пароль...";

      try {
        // Используем общий slug для раздела калькуляторов
        const result = await authCalc("calculators", password);

        if (!result.allowed) {
          if (statusEl) {
            statusEl.textContent = result.reason || "Доступ запрещён. Неверный пароль.";
          }
          if (submitBtn) submitBtn.disabled = false;
          return;
        }

        if (statusEl) statusEl.textContent = "Доступ разрешён.";

        if (hasSessionStorage) {
          try {
            window.sessionStorage.setItem(globalKey, "1");
          } catch (e) {
            // ignore
          }
        }

        // Снимаем оверлей — доступ открыт
        overlay.remove();
      } catch (err) {
        if (statusEl) statusEl.textContent = "Ошибка при проверке пароля: " + err.message;
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  document.body.appendChild(overlay);
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

    setupCalculatorsAuthGate(container);


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
