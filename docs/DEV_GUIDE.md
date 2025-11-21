# Developer Guide · SM Codex Portal

Актуальная техническая документация проекта.  
Версия обновлена после рефакторинга калькуляторов и очистки разделов.

---

# 1. Архитектура проекта

## 1.1. Общий обзор

SM Codex Portal — одностраничное приложение (SPA) на **Vanilla JavaScript**, без фреймворков.  
Все страницы — это модули, которые подгружаются по мере необходимости через lazy-loading (`import()`).

Проект разрабатывается как единый внутренний стандарт компании «Стандарт Мастер» для:

- Поддержки (L1, L2, L3),
- Отдела внедрения,
- Отдела продаж (Хантеры и Клиентский отдел),
- Операций.

Техническая цель — обеспечить модульность, расширяемость и простоту добавления новых разделов.

---

# 2. Структура проекта

```

/css
/js
/core
/modules
/calculators
/data
/docs
index.html
README.md

````

---

## 1.2. GitHub backend и n8n (целевая модель)

Целевая архитектура портала основана на модели:

- **GitHub как backend и база данных** — все данные (разделы, страницы, шаги, блоки, фильтры, калькуляторы) 
  хранятся в директории `content/` в формате JSON.
- **n8n как слой авторизации и записи** — любые изменения файлов выполняются только через n8n webhook-и,
  которые вызывают GitHub API.
- **SPA на Vanilla JS** — только читает данные из GitHub (через API/`githubClient`), 
  отображает их и отправляет изменения в n8n.

Важно:

- запрещено добавлять отдельный backend-сервер;
- запрещено использовать сторонние БД;
- запрещено хранить пароли и токены в репозитории;
- структура контента описана в `CONTENT_MODEL.md`;
- поведение конструктора описано в `CONSTRUCTOR_GUIDE.md`;
- интеграция с n8n описана в `N8N_INTEGRATION.md`.

Подробнее про архитектуру GitHub backend см. в `ARCHITECTURE_GITHUB_BACKEND.md`.


# 2. GitHub Client (только чтение)

Файл: `js/core/githubClient.js`.

Клиент инкапсулирует логику чтения файлов из репозитория GitHub через Contents API.

Ключевые функции:

- `fetchJsonFile(path, options?)` — читает JSON-файл из репозитория (`content/sections.json`, `content/filters.json`, `content/pages/*.json`, `content/calculators.json`).
- `fetchTextFile(path, options?)` — читает произвольный текстовый файл.
- `setGithubConfig(partial)` — позволяет в рантайме задать `owner`, `repo`, `branch`, `apiBase`.
- `getGithubConfig()` — возвращает текущий конфиг.

По умолчанию клиент использует значения:

```js
{
  owner: window.SM_GITHUB_OWNER || "",
  repo: window.SM_GITHUB_REPO || "",
  branch: window.SM_GITHUB_BRANCH || "main",
  apiBase: window.SM_GITHUB_API_BASE || "https://api.github.com"
}
```

SPA **никогда не содержит токены доступа** — только публичное чтение через GitHub API.

В дальнейшем разделы и страницы будут читать данные через `githubClient`, а не из локальных файлов.



# 2.1. ContentService и AppState

Файл: `js/core/contentService.js`.

Этот модуль инкапсулирует работу с `content/` через `githubClient.js` и кэширует данные в `AppState`.

Основные функции:

- `preloadContent()` — загружает `content/sections.json`, `content/filters.json`, `content/calculators.json` при старте приложения.
- `loadSections()` — читает и кэширует `sections.json`.
- `loadFilters()` — читает и кэширует `filters.json`.
- `loadCalculators()` — читает и кэширует `calculators.json`.
- `loadPage(pagePath)` — читает и кэширует страницу из `content/pages/{pagePath}`.

Глобальное состояние `AppState` (файл `js/core/state.js`) дополнено полями:

```js
export const AppState = {
  quizzes: {},
  results: [],
  sections: null,
  filters: null,
  calculators: null,
  pages: {}
};
```

Теперь любые модули могут использовать `ContentService` и `AppState` для доступа к данным GitHub backend,
а не к локальным статическим файлам.


# 3. Роутинг (SPA Router)

Файл: `js/core/router.js`.

### Ключевые особенности:
- hash-based SPA (`#support`, `#sales`, `#calculators`, …)
- ленивые модули (`import()`)
- автоматическая очистка модулей через `destroy()`

### Пример регистрации роутов:

```js
Router.register("support", () => import("/sm/js/modules/support/main.js"));
Router.register("implementation", () => import("/sm/js/modules/implementation/main.js"));
Router.register("sales", () => import("/sm/js/modules/sales/main.js"));
Router.register("calculators", () => import("/sm/js/modules/calculators/main.js"));
Router.init();
````

---

# 4. Модули разделов

Каждый раздел — независимый модуль:

```js
export default {
  name: "support",
  async init(container) { ... },
  destroy() { ... }
}
```

## Текущие разделы:

| Раздел         | Путь                         | Назначение                  |
| -------------- | ---------------------------- | --------------------------- |
| Support        | `/js/modules/support`        | L1, L2, L3 регламенты       |
| Implementation | `/js/modules/implementation` | Внедрение, процессы запуска |
| Sales          | `/js/modules/sales`          | Хантеры, клиентский отдел   |
| Calculators    | `/js/modules/calculators`    | Все калькуляторы            |
| Operations     | `/js/modules/operations`     | Операционная информация     |

---

# 5. Система калькуляторов (центральный центр)

## 5.1. Где находятся

```
/js/calculators/*.js
/js/modules/calculators/main.js
/js/modules/calculators/templates.js
```

## 5.2. Какие калькуляторы доступны

* L1 (поддержка)
* L2 (поддержка)
* Инженер внедрения
* Хантер (коммерческий отдел)
* Клиентский менеджер (аккаунт)

## 5.3. Где отображаются

**Калькуляторы полностью удалены из разделов Support / Implementation / Sales.**

Они доступны **ТОЛЬКО** в разделе:

```
#calculators
```

## 5.4. Принцип работы

Каждый калькулятор состоит из:

* HTML-шаблона (в `templates.js`)
* функции-инициализатора (`initL1Calculator`, `initL2Calculator` …)
* обёртки-модального окна

### Пример открытия калькулятора

```js
openCalcPopup("l2");
```

### Вставка шаблона и включение логики

```js
calcBody.innerHTML = L2_CALC_TEMPLATE;
initL2Calculator(calcBody);
```

---

# 6. Система квизов

## 6.1. Где лежат

```
/data/quizzes
/js/modules/quiz
```

## 6.2. Как добавить новый квиз

1. Создать JSON в `/data/quizzes/*.json`
2. Добавить запись в `QuizRegistry`
3. Добавить HTML-кнопку:

```html
<button
  class="quiz-trigger"
  data-quiz-category="support"
  data-quiz-id="l1-routing">
  Пройти квиз
</button>
```

## 6.3. Как работает поп-ап

* глобальный поп-ап создаётся один раз
* управление — в `popup.js`

---

# 7. Модальные окна

## 7.1. Поп-ап калькуляторов

Файл: `js/modules/calculators/main.js`

### Особенности:

* общий модальный компонент
* затемнение фона
* кнопка закрытия
* закрытие по клику на фон
* адаптивная сетка содержимого

## 7.2. Поп-ап квизов

Файл: `js/modules/quiz/popup.js`

Оба поп-апа используют единый UI-паттерн.

---

# 8. Фильтры (subnav)

Каждый раздел имеет подменю:

```html
<nav class="subnav-lines" data-role="support-nav"> … </nav>
```

### После рефакторинга:

* удалены пункты «Мотивация и ZP» в Sales
* удалён пункт «Мотивация и ЗП» в Implementation
* калькуляторные секции также удалены

---

# 9. Онбординги

Онбординги стандартизированы:

```html
<div class="card-grid onboarding-grid">
  <article class="card onboarding-card">
    <div class="card-title">Месяц 1</div>
    <ul><li>…</li></ul>
  </article>
</div>
```

### Файлы:

* `/js/modules/support/main.js`
* `/js/modules/implementation/main.js`
* `/js/modules/sales/main.js`

---

# 10. Матрицы ответственности и компетенций

Используют единый паттерн:

```html
<article class="card card--soft matrix-card">
  <h3 class="matrix-title">Матрица ответственности</h3>
  <div class="table-wrapper">...</div>
</article>
```

---

# 11. Как создать новый раздел

1. Создать модуль:

```
js/modules/<name>/main.js
```

2. Добавить роут:

```js
Router.register("<name>", () => import(`/sm/js/modules/${name}/main.js`));
```

3. Добавить ссылку в меню:

```html
<a href="#<name>" class="nav-link">Название</a>
```

---

# 12. Как добавить новый калькулятор

1. Создать файл в `/js/calculators`
2. Добавить HTML-шаблон в `/js/modules/calculators/templates.js`
3. Добавить кнопку в `<article … data-calc-open="name">`
4. Зарегистрировать в `openCalcPopup()`

---

# 13. Как добавить новый квиз

1. Создать JSON в `/data/quizzes`
2. Добавить запись в `QuizRegistry`
3. Добавить HTML-кнопку `quiz-trigger`

---

# 14. Код-стайл и стандарты

* Только **Vanilla JS**
* Только ES-модули
* Чёткое разделение шаблонов, логики и данных
* Никакого inline-HTML JS-кода
* Никаких фреймворков
* Максимальная читаемость и масштабируемость
* Переиспользование UI-компонентов
* SPA-переходы только через Router

---

# 15. Поддержка и расширение

При добавлении нового функционала:

* **разрешено**: расширять `calculators/main.js`, `quiz/*`, `templates.js`
* **запрещено**: возвращать калькуляторы в разделы Support / Sales / Implementation
* разделы должны оставаться чистыми от модулей мотивации

---

# 16. Контакты

Если проект поддерживается несколькими командами — добавьте контактную информацию.

# 4. StepRenderer (отображение шагов страницы)

Файл: `js/core/stepRenderer.js`.

Компонент принимает контейнер и JSON страницы в формате из `CONTENT_MODEL.md` и:

- показывает заголовок и описание страницы;
- отображает текущий шаг;
- рисует простую полосу прогресса;
- переключает шаги по кнопкам «Назад» / «Далее».

На шаге 3.1 `StepRenderer` пока не рендерит содержимое `blocks[]` — только каркас шага.
Подробный рендер блоков будет реализован в `BlocksRenderer` на шаге 3.2.

# 6. Маршрут page/:slug (step-by-step страницы)

Для отображения страниц из `content/pages` используется маршрут:

```text
#page/{slug}
```

Где `slug` — это `id` или `slug` страницы из `content/sections.json`.

Модуль: `js/modules/page/main.js`.

Логика:

- модуль читает `window.location.hash`;
- извлекает `slug` после `#page/`;
- ищет страницу в `AppState.sections.sections[].pages[]`;
- по найденной странице берёт `pagePath`;
- загружает JSON страницы через `ContentService.loadPage(pagePath)`;
- рендерит её через `StepRenderer`.

Таким образом, любые страницы, описанные в `sections.json` и `content/pages/*`,
могут быть показаны в едином step-by-step формате.

# 7. Маршрут constructor (UI конструктора)

Маршрут:

```text
#constructor
```

Модуль: `js/modules/constructor/main.js`.

Назначение:

- показывает структуру контента из GitHub backend в виде:
  - список разделов (`sections.json`);
  - список страниц выбранного раздела;
  - шаги выбранной страницы;
  - блоки выбранного шага.
- на этом этапе работает только в режиме **просмотра**:
  - кнопки «Добавить», «Удалить», «Переместить» визуально присутствуют,
    но отключены и не меняют данные.

В дальнейшем (шаг 4.2 и блок 5) этот экран будет расширен локальной моделью изменений
и интеграцией с n8n для сохранения правок.

## 7.1. Локальная модель конструктора (Шаг 4.2)

На этапе 4.2 конструктор использует локальную модель данных:

- при инициализации создаётся глубокая копия `AppState.sections` в `localState.sections`;
- при выборе страницы создаётся черновик страницы в `localState.pages[pagePath]`;
- операции «Добавить», «Удалить», «Переместить вверх» изменяют только `localState`,
  не вызывая n8n и не записывая данные в GitHub.

Таким образом, экран конструктора работает как песочница для редактирования структуры
(разделы → страницы → шаги → блоки) без сохранения.

## 7.2. Интеграция конструктора с n8n (Шаг 5.3)

Для сохранения/удаления страниц из конструктора используется модуль `js/api/constructorApi.js`
и n8n-webhook `SM_N8N_SAVE_PAGE_URL` (по умолчанию: 
`https://jolikcisout.beget.app/webhook/sm/constructor/save-page`).

Конструктор вызывает:

- `upsertPage(pagePath, pageJson, options)` — создать/обновить страницу;
- `deletePage(pagePath, options)` — удалить страницу из репозитория.

Вся логика записи в GitHub реализована внутри n8n.

## 8. Редактор filters.json (Шаг 6.1)

Маршрут (рекомендуемый): 

```text
#filters
```

Модуль: `js/modules/filters/main.js`.

Возможности на этом шаге:

- загрузка `content/filters.json` через `ContentService.loadFilters()` (GitHub backend);
- локальная копия `filters` в памяти;
- редактирование:
  - `lines[]` — id/label/order;
  - `caseTypes[]` — id/label/order;
  - `categories[]` — id/label/order;
- управление связями «тип кейса ↔ линия» через поле `caseType.lines: string[]`:
  - визуально — таблица с чекбоксами;
  - при изменении чекбоксов обновляется `lines[]` у соответствующего `caseType`.

На шаге 6.1 **нет сохранения** в GitHub — это чистый UI и локальная модель.
Интеграция с n8n (`/constructor/save-filters`) будет добавлена на шаге 6.2.

### 8.1. Сохранение filters.json через n8n (Шаг 6.2)

Редактор фильтров (`js/modules/filters/main.js`) использует API-клиент `js/api/filtersApi.js`:

- URL webhook-а по умолчанию: `https://jolikcisout.beget.app/webhook/sm/constructor/save-filters`
- при необходимости его можно переопределить через `window.SM_N8N_SAVE_FILTERS_URL`.

Вызов сохранения:

```js
import { saveFilters } from "/sm/js/api/filtersApi.js";

await saveFilters(filtersJson, {
  sha: null,
  commitMessage: "Update filters.json via filters-editor",
  author: { source: "filters-editor-ui" }
});
```

Контракт ответа n8n:

```json
{
  "ok": true,
  "mode": "upsert-filters",
  "sha": "newsha123",
  "committedAt": "2025-01-01T12:00:00.000Z"
}
```

В случае ошибки `ok = false` и присутствует поле `error`.
