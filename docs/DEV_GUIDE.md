# SM Codex Portal · Dev Guide

Этот файл — краткая документация по архитектуре портала и тому, как добавлять новые разделы, квизы и калькуляторы.

## 1. Архитектура SPA

- Точка входа: `index.html`
- Основной модуль: `js/main.js`
  - Использует `Router` (`js/core/router.js`) для ленивой загрузки разделов.
  - Регистрация роутов:
    - `dashboard` → `/js/modules/results/main.js`
    - `support` → `/js/modules/support/main.js`
    - `sales` → `/js/modules/sales/main.js`
    - `operations` → `/js/modules/operations/main.js`
    - `implementation` → `/js/modules/implementation/main.js`
    - `results` → `/js/modules/results/main.js`
    - `quiz` → `/js/modules/quiz/main.js`
    - `calculators` → `/js/modules/calculators/main.js`

Шапка сайта (`index.html`) содержит навигацию через `href="#routeName"`.

## 2. Общий модуль квизов

### 2.1. Где логика

- Реестр квизов: `js/modules/quiz/registry.js`
- Движок: `js/modules/quiz/engine.js`
- Глобальный попап: `js/modules/quiz/popup.js`

Инициализация глобального попапа выполняется в `js/main.js`:

```js
import { initQuizPopupGlobal } from "/sm/js/modules/quiz/popup.js";

Theme.init();
Router.init();
initQuizPopupGlobal();
```

### 2.2. Как добавить квиз

1. Создать JSON в `data/quizzes/*.json`, например:

```jsonc
{
  "id": "sales-v1",
  "category": "sales",
  "title": "Квизы по отделу продаж",
  "version": 1,
  "quizzes": [
    {
      "id": "hunter-routing",
      "title": "Маршрутизация задач: хантер или не хантер",
      "questions": [
        {
          "prompt": "Клиент оставил заявку на демонстрацию iiko...",
          "options": [
            { "text": "Хантер", "correct": true, "note": "..." },
            { "text": "Клиентский отдел", "correct": false, "note": "..." },
            { "text": "Поддержка", "correct": false, "note": "..." }
          ]
        }
      ]
    }
  ]
}
```

2. Зарегистрировать путь в `QuizRegistry`:

```js
export const QuizRegistry = {
  support: "/sm/data/quizzes/support.json",
  implementation: "/sm/data/quizzes/implementation.json",
  sales: "/sm/data/quizzes/sales.json",
  // новому разделу — новый ключ
  newsection: "/sm/data/quizzes/newsection.json"
};
```

3. В разметке раздела добавить кнопку:

```html
<button
  type="button"
  class="btn btn-sm quiz-trigger"
  data-quiz-category="sales"
  data-quiz-id="hunter-routing">
  Квиз: маршрутизация для хантера
</button>
```

Больше никакого кода на стороне раздела не нужно — попап и логика уже глобальные.

## 3. Общий модуль калькуляторов

### 3.1. Core-утилита

Файл: `js/calculators/core.js`

```js
export const NDFL_RATE = 0.13;

export function formatMoney(value) {
  if (!Number.isFinite(value)) return "0 ₽";
  return Math.round(value).toLocaleString("ru-RU") + " ₽";
}

export function parseNumber(input, fallback = 0) {
  if (!input) return fallback;
  const raw = String(input.value || "").replace(",", ".").trim();
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function attachAutoRecalc(inputs, handler) {
  if (!Array.isArray(inputs) || typeof handler !== "function") return;
  ["input", "change"].forEach((evt) => {
    inputs.forEach((el) => el && el.addEventListener(evt, handler));
  });
}
```

Все калькуляторы (L1, L2, Implementation, Sales) импортируют эти функции вместо своих локальных реализаций.

### 3.2. Существующие калькуляторы

- `js/calculators/l1.js` — L1 поддержка
- `js/calculators/l2.js` — L2 поддержка
- `js/calculators/implementation.js` — внедрение
- `js/calculators/sales.js` — хантеры и клиентский отдел

Каждый модуль экспортирует функции вида:

```js
export function initL1Calculator(root) { ... }
export function initL2Calculator(root) { ... }
export function initImplementationCalculator(root) { ... }
export function initSalesHunterCalculator(root) { ... }
export function initSalesClientCalculator(root) { ... }
```

`root` — DOM-элемент, внутри которого модуль ищет свою разметку (инпуты и блоки вывода).

### 3.3. Общая страница калькуляторов

- Модуль: `js/modules/calculators/main.js`
- Маршрут: `#calculators`
- Навигация: ссылка в `index.html` — «Калькуляторы»

Страница выводит карточки с кратким описанием и хост-блоками:

```html
<article class="card" data-calc-l1-block>
  <div class="card-title">L1 · Инженер поддержки</div>
  <div data-role="l1-calculator-host"></div>
</article>
```

Инициализация:

```js
import { initL1Calculator } from "/sm/js/calculators/l1.js";
// ...

const l1Host = container.querySelector("[data-role='l1-calculator-host']");
if (l1Host) initL1Calculator(l1Host);
```

Калькуляторы также остаются в своих «родных» разделах (Support, Implementation, Sales).

## 4. Онбординги и матрицы

### 4.1. Онбординг

Для всех онбордингов используется единая сетка:

```html
<div class="card-grid onboarding-grid">
  <article class="card onboarding-card">
    <div class="card-title">Месяц 1 — База</div>
    <ul class="list small">
      <li>...</li>
    </ul>
  </article>
  <!-- еще 2–3 карточки -->
</div>
```

CSS (`styles.css`):

```css
.onboarding-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 10px;
}

.onboarding-card .card-title {
  font-size: 15px;
  margin-bottom: 6px;
}
```

Подход уже применён к онбордингам в Support, Implementation и Sales.

### 4.2. Матрицы ответственности / компетенций

Единый шаблон:

```html
<article class="card card--soft matrix-card">
  <h3 class="matrix-title">Матрица ответственности</h3>
  <div class="table-wrapper">
    <table class="table table-sm">
      <thead>...</thead>
      <tbody>...</tbody>
    </table>
  </div>
</article>
```

CSS:

```css
.matrix-card {
  margin-top: 12px;
}

.matrix-card .matrix-title {
  font-size: 15px;
  margin-bottom: 8px;
}

.matrix-card .table {
  font-size: 12px;
}
```

В существующих разделах матрицы уже помечены классом `matrix-card`.

## 5. Добавление нового раздела

1. Создать папку `js/modules/<section>/`.
2. Добавить файл `main.js`:

```js
const NewSectionPage = {
  name: "newsection",

  async init(container) {
    container.innerHTML = `
      <section class="section section--newsection">
        <header class="section-header">
          <h2>Название раздела</h2>
          <p class="tagline">Короткое описание.</p>
        </header>

        <!-- контент, onboarding-grid, matrix-card, кейсы, квизы и т.д. -->
      </section>
    `;
  },

  destroy() {}
};

export default NewSectionPage;
```

3. Зарегистрировать роут в `js/main.js`:

```js
Router.register("newsection", () => import("/sm/js/modules/newsection/main.js"));
```

4. Добавить пункт в навигацию `index.html`:

```html
<a href="#newsection" class="nav-link">NewSection</a>
```

5. (Опционально) Добавить квизы:
   - JSON в `data/quizzes/newsection.json`
   - ключ в `QuizRegistry`
   - кнопки с `data-quiz-category="newsection"`.

6. (Опционально) Добавить калькуляторы для раздела:
   - модуль `js/calculators/newsection.js`, использующий `core.js`;
   - интеграция в `js/modules/calculators/main.js` по аналогии с существующими.

## 6. Стиль и принципы

- Без фреймворков, ванильный JS + модульная структура.
- SPA, навигация через hash и `Router`.
- Повторяющиеся элементы (квизы, калькуляторы, онбординг, матрицы) — через общие модули и CSS-паттерны.
- Все новые сущности (разделы, квизы, калькуляторы) должны быть:
  - читаемыми,
  - масштабируемыми,
  - максимально самодокументированными.
