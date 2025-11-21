// js/modules/calc/main.js
//
// Страница одного калькулятора `/calc/:slug` (Шаг 7.1).
// Логика:
//  - загружаем список калькуляторов из calculators.json
//  - находим по slug текущий калькулятор
//  - показываем форму ввода пароля
//  - отправляем пароль в n8n `/calc-auth` через authCalc()
//  - при успешном ответе показываем "доступ разрешён" и контейнер для калькулятора
//
// ВАЖНО: сама бизнес-логика калькулятора (формулы, UI) живёт отдельно.
// Здесь только доступ + оболочка.

import ContentService from "/sm/js/core/contentService.js";
import { authCalc } from "/sm/js/api/calcAuthApi.js";

function showToast(message) {
  alert(message);
}

function createLayout(container, calcMeta) {
  const title = calcMeta?.title || "Калькулятор";
  const description = calcMeta?.description || "";

  container.innerHTML = `
    <section class="page page--calc">
      <header class="page-header">
        <h1 class="page-title">${title}</h1>
        ${
          description
            ? `<p class="page-description">${description}</p>`
            : ""
        }
      </header>

      <section class="calc-auth">
        <h2 class="calc-auth-title">Доступ к калькулятору</h2>
        <p class="small text-muted">
          Для использования калькулятора требуется пароль. 
          Пароль не сохраняется в браузере и проверяется только через n8n.
        </p>

        <form class="calc-auth-form" data-form="calc-auth">
          <label class="form-field">
            <span class="form-label">Пароль</span>
            <input 
              type="password" 
              name="password" 
              class="input" 
              placeholder="Введите пароль"
              autocomplete="off"
              required
            />
          </label>
          <button type="submit" class="btn btn--primary">
            Войти в калькулятор
          </button>
        </form>

        <div class="calc-auth-status" data-calc-auth-status></div>
      </section>

      <section class="calc-body" data-calc-body hidden>
        <h2 class="calc-body-title">Калькулятор</h2>
        <p class="small text-muted">
          Доступ разрешён. Здесь подключается UI и логика конкретного калькулятора.
        </p>
        <div class="calc-body-inner" data-calc-body-inner>
          <!-- Точка расширения под реальный калькулятор (iframe / локальный UI / и т.п.) -->
        </div>
      </section>
    </section>
  `;
}

function bindAuthForm(container, calcMeta) {
  const form = container.querySelector('[data-form="calc-auth"]');
  const statusEl = container.querySelector("[data-calc-auth-status]");
  const calcBody = container.querySelector("[data-calc-body]");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const password = String(formData.get("password") || "").trim();

    if (!password) {
      showToast("Введите пароль.");
      return;
    }

    form.querySelector("button[type='submit']").disabled = true;
    statusEl.textContent = "Проверяем пароль...";
    try {
      const result = await authCalc(calcMeta.slug, password);
      // Ожидаемый ответ n8n:
      // { ok: true, allowed: true/false, reason?: string }
      if (!result.allowed) {
        statusEl.textContent = result.reason || "Доступ запрещён.";
        showToast("Пароль неверный или доступ запрещён.");
        return;
      }

      statusEl.textContent = "Доступ разрешён.";
      showToast("Доступ к калькулятору разрешён.");
      if (calcBody) {
        calcBody.hidden = false;
      }

      // Здесь можно дополнительно:
      //  - подгрузить конфигурацию калькулятора из result.config
      //  - инициализировать iframe или локальный UI
      // но на шаге 7.1 мы ограничиваемся оболочкой.
    } catch (err) {
      console.error("[Calc] auth error", err);
      statusEl.textContent = "Ошибка при проверке пароля.";
      showToast("Ошибка при проверке пароля: " + err.message);
    } finally {
      form.querySelector("button[type='submit']").disabled = false;
    }
  });
}

async function loadCalcMeta(slug) {
  // calculators.json должен грузиться через ContentService по GitHub backend
  const calculators = await ContentService.loadCalculators();
  const list = Array.isArray(calculators?.items) ? calculators.items : calculators || [];
  const calcMeta = list.find((item) => item.slug === slug) || null;
  return calcMeta;
}

export default {
  name: "calc",

  /**
   * init(container, ctx)
   * ctx.slug — слаг калькулятора из роутера (например, #calc/l2-salary)
   */
  async init(container, ctx = {}) {
    const slug = ctx.slug || ctx.id || ctx.calcSlug || null;
    if (!slug) {
      container.innerHTML = `
        <section class="page page--calc">
          <header class="page-header">
            <h1 class="page-title">Калькулятор</h1>
          </header>
          <p>Не задан слаг калькулятора. Откройте страницу через маршрут <code>#calc/&lt;slug&gt;</code>.</p>
        </section>
      `;
      return;
    }

    const calcMeta = await loadCalcMeta(slug);
    if (!calcMeta) {
      container.innerHTML = `
        <section class="page page--calc">
          <header class="page-header">
            <h1 class="page-title">Калькулятор</h1>
          </header>
          <p>Калькулятор с слагом <code>${slug}</code> не найден в <code>content/calculators.json</code>.</p>
        </section>
      `;
      return;
    }

    createLayout(container, calcMeta);
    bindAuthForm(container, calcMeta);
  }
};
