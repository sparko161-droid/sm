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
