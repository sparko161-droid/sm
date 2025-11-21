import { authCalc } from "/sm/js/api/calcAuthApi.js";
import { initL1Calculator } from "/sm/js/calculators/l1.js";
import { initL2Calculator } from "/sm/js/calculators/l2.js";
import { initImplementationCalculator } from "/sm/js/calculators/implementation.js";
import { initSalesHunterCalculator, initSalesClientCalculator } from "/sm/js/calculators/sales.js";
import { L1_CALC_TEMPLATE, L2_CALC_TEMPLATE, IMPL_CALC_TEMPLATE,..._CALC_TEMPLATE } from "/sm/js/modules/calculators/templates.js";

function ensureCalcAuthShakeStyles() {
  if (document.querySelector("style[data-calc-auth-shake]")) {
    return;
  }

  const style = document.createElement("style");
  style.setAttribute("data-calc-auth-shake", "true");
  style.textContent = `
    @keyframes calc-auth-shake {
      0%   { transform: translateX(0); }
      25%  { transform: translateX(-6px); }
      50%  { transform: translateX(6px); }
      75%  { transform: translateX(-4px); }
      100% { transform: translateX(0); }
    }

    .calc-auth-dialog.shake {
      animation: calc-auth-shake 0.18s ease-in-out;
    }
  `;
  document.head.appendChild(style);
}

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

  ensureCalcAuthShakeStyles();

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

  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
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
      backgroundColor: "var(--card-bg)",
      color: "var(--text-main)",
      borderRadius: "24px",
      padding: "24px 24px 20px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    });
  }

  const titleEl = overlay.querySelector(".calc-auth-title");
  if (titleEl) {
    Object.assign(titleEl.style, {
      margin: "0 0 4px",
      fontSize: "20px",
      fontWeight: "700"
    });
  }

  const textEl = overlay.querySelector(".calc-auth-text");
  if (textEl) {
    Object.assign(textEl.style, {
      margin: "0 0 8px",
      fontSize: "13px",
      lineHeight: "1.5",
      color: "var(--text-muted)"
    });
  }

  const statusEl = overlay.querySelector("[data-calc-auth-status]");
  if (statusEl) {
    Object.assign(statusEl.style, {
      marginTop: "6px",
      fontSize: "12px",
      minHeight: "16px",
      color: "var(--text-muted)"
    });
  }

  const form = overlay.querySelector("[data-calc-auth-form]");
  const passwordInput = overlay.querySelector('input[name="password"]');

  if (form) {
    Object.assign(form.style, {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      marginTop: "4px"
    });
  }

  const btn = overlay.querySelector(".btn.btn--primary");
  if (btn) {
    btn.style.padding = "7px 16px";
    btn.style.fontSize = "13px";
    btn.style.alignSelf = "flex-end";
  }

  if (passwordInput) {
    setTimeout(() => {
      passwordInput.focus();
    }, 40);
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const password = String(formData.get("password") || "").trim();

      if (!password) {
        if (statusEl) {
          statusEl.textContent = "Введите пароль.";
          statusEl.style.color = "var(--red)";
        }
        if (passwordInput) passwordInput.focus();
        return;
      }

      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;
      if (statusEl) {
        statusEl.textContent = "Проверяем пароль...";
        statusEl.style.color = "var(--text-muted)";
      }

      if (dialog) {
        dialog.classList.remove("shake");
        dialog.offsetWidth;
      }

      try {
        const result = await authCalc("calculators", password);

        if (!result.allowed) {
          if (statusEl) {
            statusEl.textContent =
              result.reason || "Доступ запрещён. Неверный пароль.";
            statusEl.style.color = "var(--red)";
          }
          if (submitBtn) submitBtn.disabled = false;
          if (passwordInput) {
            passwordInput.focus();
            passwordInput.select();
          }
          if (dialog) {
            dialog.classList.add("shake");
          }
          return;
        }

        if (statusEl) {
          statusEl.textContent = "Доступ разрешён.";
          statusEl.style.color = "var(--text-muted)";
        }

        if (hasSessionStorage) {
          try {
            window.sessionStorage.setItem(globalKey, "1");
          } catch (e) {}
        }

        overlay.remove();
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = "Ошибка при проверке пароля: " + err.message;
          statusEl.style.color = "var(--red)";
        }
        if (submitBtn) submitBtn.disabled = false;
        if (dialog) {
          dialog.classList.add("shake");
        }
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

        <div class="calc-grid">
          <article class="calc-card" data-calc-type="l1">
            <h3>L1 · Инженер поддержки</h3>
            <p>Оклад + премия за закрытие и создание с учётом пропущенных обращений и просрочек SLA.</p>
            <button class="btn btn--secondary" data-calc-open="l1">Открыть калькулятор</button>
          </article>

          <article class="calc-card" data-calc-type="l2">
            <h3>L2 · Инженер выездной / проектный</h3>
            <p>Оклад, город, закрытые тикеты, выезды, терминалы, доп. работы и командные показатели.</p>
            <button class="btn btn--secondary" data-calc-open="l2">Открыть калькулятор</button>
          </article>

          <article class="calc-card" data-calc-type="impl">
            <h3>Инженер внедрения</h3>
            <p>Оклад + факт нормо-часов × ставка × личный коэффициент × командный коэффициент.</p>
            <button class="btn btn--secondary" data-calc-open="impl">Открыть калькулятор</button>
          </article>

          <article class="calc-card" data-calc-type="sales-hunter">
            <h3>Хантер (отдел продаж)</h3>
            <p>Оклад, маржа, клауд и коэффициенты KPI (новые клиенты, апсейл, удержание).</p>
            <button class="btn btn--secondary" data-calc-open="sales-hunter">Открыть калькулятор</button>
          </article>

          <article class="calc-card" data-calc-type="sales-client">
            <h3>Клиентский отдел</h3>
            <p>Оклад, портфель, клауд и коэффициенты для аккаунт-менеджера.</p>
            <button class="btn btn--secondary" data-calc-open="sales-client">Открыть калькулятор</button>
          </article>
        </div>

        <div class="calc-modal-backdrop" data-calc-backdrop hidden>
          <div class="calc-modal" data-calc-modal>
            <header class="calc-modal__header">
              <h3 data-calc-modal-title>Калькулятор</h3>
              <button class="icon-button" data-calc-close>&times;</button>
            </header>
            <section class="calc-modal__body" data-calc-body></section>
          </div>
        </div>
      </section>
    `;

    setupCalculatorsAuthGate(container);

    const backdrop = container.querySelector("[data-calc-backdrop]");
    const bodyEl = container.querySelector("[data-calc-body]");
    const closeBtn = container.querySelector("[data-calc-close]");

    const modalTitleEl = container.querySelector("[data-calc-modal-title]");
    const modalEl = container.querySelector("[data-calc-modal]");

    const open = (type) => {
      if (!backdrop || !bodyEl || !modalEl) return;
      let template = "";
      let title = "Калькулятор";

      switch (type) {
        case "l1":
          template = L1_CALC_TEMPLATE;
          title = "L1 · Инженер поддержки";
          break;
        case "l2":
          template = L2_CALC_TEMPLATE;
          title = "L2 · Инженер выездной / проектный";
          break;
        case "impl":
          template = IMPL_CALC_TEMPLATE;
          title = "Инженер внедрения";
          break;
        case "sales-hunter":
          template = SALES_HUNTER_CALC_TEMPLATE;
          title = "Хантер (отдел продаж)";
          break;
        case "sales-client":
          template = SALES_CLIENT_CALC_TEMPLATE;
          title = "Клиентский отдел";
          break;
        default:
          template = "";
      }

      bodyEl.innerHTML = template;
      if (modalTitleEl) {
        modalTitleEl.textContent = title;
      }

      backdrop.hidden = false;
      requestAnimationFrame(() => {
        modalEl.classList.add("calc-modal--open");
      });

      switch (type) {
        case "l1":
          initL1Calculator(bodyEl);
          break;
        case "l2":
          initL2Calculator(bodyEl);
          break;
        case "impl":
          initImplementationCalculator(bodyEl);
          break;
        case "sales-hunter":
          initSalesHunterCalculator(bodyEl);
          break;
        case "sales-client":
          initSalesClientCalculator(bodyEl);
          break;
      }
    };

    const close = () => {
      if (!backdrop || !bodyEl || !modalEl) return;
      modalEl.classList.remove("calc-modal--open");
      setTimeout(() => {
        backdrop.hidden = true;
        bodyEl.innerHTML = "";
      }, 150);
    };

    container.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-calc-open]");
      if (btn) {
        const type = btn.getAttribute("data-calc-open");
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
