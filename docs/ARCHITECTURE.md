# SM Codex Portal · ARCHITECTURE

Подробная техническая документация по структуре и работе проекта.

Проект — одностраничный портал (SPA) на Vanilla JS для внутренних регламентов компании «Стандарт Мастер»:
- Поддержка (L1/L2/L3)
- Внедрение
- Продажи (Хантеры и клиентский отдел)
- Операции

---

## 1. Общая структура проекта

Корень проекта:
index.html
/ css
/ js
  / core
  / modules
  / calculators
/ data
/ docs
/ assets (если есть)
1.1 Основной стек
JavaScript: ES-модули, без фреймворков.

SPA: навигация по хэшу (#support, #sales, #calculators и т.д.).

Маршрутизация: собственный Router.

UI: семантический HTML + кастомный CSS.

Состояние: минимум глобального состояния, всё внутри модулей страниц.

2. Входная точка и каркас
2.1 index.html
Основные элементы:

<header> — шапка портала с основным меню (Dashboard, Support, Sales, Operations, Implementation, Results, Calculators).

<main id="app-root"> — контейнер, в который Router подставляет текущий модуль.

Базовый подключаемый скрипт:

html
Копировать код
<script type="module" src="/sm/js/main.js"></script>
Именно через js/main.js запускается приложение.

3. Ядро (core)
3.1 js/main.js
Отвечает за:

инициализацию темы (dark/light, если предусмотрено);

инициализацию Router;

регистрацию всех маршрутов;

глобальную инициализацию квизового поп-апа;

навешивание общих обработчиков (например, подсветка активного пункта меню).

Ключевые шаги:

js
Копировать код
import { Router } from "/sm/js/core/router.js";
import { Theme } from "/sm/js/core/theme.js";
import { initQuizPopupGlobal } from "/sm/js/modules/quiz/popup.js";

Theme.init();
Router.register("support", () => import("/sm/js/modules/support/main.js"));
Router.register("implementation", () => import("/sm/js/modules/implementation/main.js"));
Router.register("sales", () => import("/sm/js/modules/sales/main.js"));
Router.register("operations", () => import("/sm/js/modules/operations/main.js"));
Router.register("calculators", () => import("/sm/js/modules/calculators/main.js"));
Router.register("results", () => import("/sm/js/modules/results/main.js"));

Router.init();
initQuizPopupGlobal();
3.2 js/core/router.js
Функции:

регистрация модулей по ключу (Router.register(name, loader)),

слежение за window.location.hash,

lazy-loading модуля по запросу (через import()),

вызов init(container) у активного модуля,

вызов destroy() у предыдущего модуля.

Особенности:

контейнером обычно является document.getElementById("app-root");

в URL используются короткие ключи (#support, #sales, #calculators).

3.3 Другие core-файлы (если есть)
theme.js — переключение темы, работа с CSS-переменными.

storage.js — удобная обёртка вокруг localStorage (если используется).

Любые общие утилиты для логов, форматирования и т.д.

4. Модули разделов (/js/modules)
Каждый раздел — отдельный модуль с единым интерфейсом:

js
Копировать код
const SupportPage = {
  name: "support",
  async init(container) {
    container.innerHTML = `...`;
    // навешивание обработчиков
  },
  destroy() {
    // очистка слушателей, таймеров, если нужно
  }
};

export default SupportPage;
4.1 js/modules/support/main.js — Поддержка
Содержит:

описание миссии и задач L1/L2/L3;

зону ответственности по линиям;

регламенты, «что делаем / не делаем»;

онбординг L1/L2;

матрицу компетенций и ответственности;

кейсы и квизы по поддержке.

Навигация раздела реализована через подменю:

html
Копировать код
<nav class="subnav-lines" data-role="support-nav">
  <button data-target="overview">Общее</button>
  <button data-target="l1">L1</button>
  <button data-target="l2">L2</button>
  <button data-target="cases">Кейсы</button>
  <button data-target="onboarding">Онбординг</button>
  <button data-target="matrix">Матрица</button>
</nav>
Важно:

калькуляторов в этом модуле больше нет — весь функционал мотивации вынесен в общий раздел «Калькуляторы»;

data-support-section="..." используется для переключения секций внутри страницы (показ/скрытие блоков).

4.2 js/modules/implementation/main.js — Внедрение
Содержит:

миссию отдела внедрения;

принципы работы;

зону ответственности и «что делает / не делает»;

полный цикл внедрения;

онбординг инженера (3 месяца, в виде карточек слева-направо);

матрицу взаимодействия с поддержкой и продажами;

кейсы и квизы по внедрению.

Подменю:

html
Копировать код
<nav class="subnav-lines" data-role="impl-nav">
  <button data-target="overview">Общее</button>
  <button data-target="responsibility">Зоны ответственности</button>
  <button data-target="process">Процесс внедрения</button>
  <button data-target="cases">Кейсы</button>
  <button data-target="onboarding">Онбординг</button>
  <button data-target="matrix">Матрица ответственности</button>
</nav>
Примечание:

бывший раздел «Мотивация и ЗП» полностью очищен:
и кнопка фильтра, и текст, и калькулятор — удалены;

мотивация инженера внедрения теперь доступна только через общий раздел «Калькуляторы».

4.3 js/modules/sales/main.js — Продажи
Содержимое:

описание структуры отдела продаж (Хантеры + Клиентский отдел);

регламенты, зоны ответственности каждого под-отдела;

процессы работы с лидами и текущими клиентами;

должностные инструкции;

скрипты, работа с возражениями;

кейсы по продажам;

онбординг по уровням (грейдам) и направлениям.

Подменю:

html
Копировать код
<nav class="subnav-lines" data-role="sales-nav">
  <button data-target="overview">Общее</button>
  <button data-target="hunter">Хантеры</button>
  <button data-target="client">Клиентский отдел</button>
  <button data-target="cases">Кейсы и квизы</button>
  <button data-target="onboarding">Онбординг</button>
</nav>
Примечание:

блок «Мотивация и калькуляторы ZP» и соответствующая кнопка фильтра полностью удалены;

ZP хантера и аккаунта считаются исключительно через центральный раздел «Калькуляторы».

4.4 js/modules/calculators/main.js — Калькуляторы
Это центральный хаб мотивации.

Отвечает за:

отображение сетки карточек калькуляторов:

html
Копировать код
<article class="card card--clickable" data-calc-open="l1">...</article>
<article class="card card--clickable" data-calc-open="l2">...</article>
<article class="card card--clickable" data-calc-open="impl">...</article>
<article class="card card--clickable" data-calc-open="sales-h">...</article>
<article class="card card--clickable" data-calc-open="sales-c">...</article>
создание модального окна для калькуляторов:

html
Копировать код
<div class="calc-backdrop" data-calc-backdrop hidden>
  <div class="calc-dialog">
    <button class="calc-close" data-calc-close>×</button>
    <div class="calc-dialog-body" data-calc-body></div>
  </div>
</div>
вставку HTML-шаблона нужного калькулятора из templates.js;

вызов соответствующего инициализатора:

js
Копировать код
import { L1_CALC_TEMPLATE, L2_CALC_TEMPLATE, ... } from "./templates.js";
import { initL1Calculator } from "/sm/js/calculators/l1.js";
// ...

function openCalcPopup(type) {
  const body = popup.querySelector("[data-calc-body]");

  if (type === "l1") {
    body.innerHTML = L1_CALC_TEMPLATE;
    initL1Calculator(body);
  }
  // и т.д. для остальных типов
}
4.5 js/modules/operations/main.js
Содержит:

общую операционную информацию;

процессы взаимодействия между отделами;

возможно, сводные регламенты и KPI (зависит от текущей версии проекта).

4.6 js/modules/results/main.js / Dashboard
Если используется:

собирает сводные показатели,

даёт быстрые ссылки на ключевые разделы,

может служить точкой входа по умолчанию.

5. Модули калькуляторов (/js/calculators)
Здесь лежит логика всех калькуляторов мотивации.

5.1 core.js
Общие функции:

NDFL_RATE — ставка НДФЛ (0.13)

formatMoney(value) — форматирование суммы: округление и ru-RU формат

parseNumber(input, fallback) — безопасный парсинг чисел из полей ввода

attachAutoRecalc(inputs, handler) — привязка событий input/change на пересчёт

Все калькуляторы используют эти функции, локальных дубликатов быть не должно.

5.2 l1.js
Функция:

js
Копировать код
export function initL1Calculator(root) { ... }
Описание:

находит поля L1-калькулятора внутри root по ID (например, #l1-fact, #l1-plan, #l1-total и т.п.);

пересчитывает:

выполнение личного плана,

командный план по % пропущенных обращений,

итоговую премию,

НДФЛ (только с оклада),

«грязную» и «чистую» суммы.

5.3 l2.js
Функция:

js
Копировать код
export function initL2Calculator(root) { ... }
Описание:

находит элементы калькулятора по ID (#l2-grade, #l2-visits, #l2-terminals, #l2-total и т.д.);

использует грейд L2 и параметры выполненных работ;

считает итоговую мотивацию с учётом оклада, выездов, терминалов и просрочек;

форматирует значения через formatMoney.

Шаблон для L2 в templates.js очищен от лишних текстов:
включает только калькулятор, без обучающих блоков.

5.4 implementation.js
Функция:

js
Копировать код
export function initImplementationCalculator(root) { ... }
Описание:

считает ЗП инженера внедрения:

оклад,

факт нормо-часов,

ставку,

личный и командный коэффициенты;

НДФЛ считается только с окладной части;

работает строго по формуле, согласованной с бизнесом.

5.5 sales.js
Функции:

js
Копировать код
export function initSalesHunterCalculator(root) { ... }
export function initSalesClientCalculator(root) { ... }
Описание:

оба калькулятора используют общие принципы:

маржа,

облачные сервисы,

дополнительные премии,

НДФЛ только с оклада;

параметры грейдов и точные формулы берутся из бизнес-логики отдела продаж.

5.6 js/modules/calculators/templates.js
Содержит HTML-шаблоны:

L1_CALC_TEMPLATE

L2_CALC_TEMPLATE

IMPL_CALC_TEMPLATE

SALES_H_CALC_TEMPLATE

SALES_C_CALC_TEMPLATE

Каждый — строка с HTML-разметкой соответствующего калькулятора, 1:1 совпадающая с оригинальными версиями из модулей разделов.

6. Система квизов (/js/modules/quiz)
Основные файлы:

registry.js — реестр категорий и путей к JSON-файлам квизов

engine.js — логика:

загрузка JSON,

отображение вопросов,

проверка ответов,

подсчёт результата;

popup.js — глобальный поп-ап квизов:

создание DOM-попапа,

открытие / закрытие,

хост для квиз-движка.

7. Данные (/data)
7.1 Квизы
Пример структуры data/quizzes/support.json:

jsonc
Копировать код
{
  "id": "support-v1",
  "category": "support",
  "title": "Квизы по поддержке",
  "quizzes": [
    {
      "id": "routing-l1-l2",
      "title": "Маршрутизация задач: L1 или L2",
      "questions": [
        {
          "prompt": "Клиент пишет, что не работает печать чеков...",
          "options": [
            { "text": "Это зона L1", "correct": true, "note": "..." },
            { "text": "Сразу на L2", "correct": false, "note": "..." },
            { "text": "Сразу на внедрение", "correct": false, "note": "..." }
          ]
        }
      ]
    }
  ]
}
8. Стили (/css)
Основной файл:

css/styles.css — базовые стили:

типографика,

кнопки,

карточки,

сетки (card-grid, onboarding-grid, matrix-card),

sticky-шапка и sticky-фильтры.

Дополнительно:

компонентные стили (например, для квизового и калькуляторного поп-апов) могут быть вынесены в отдельные файлы в css/components.

9. Паттерны переиспользования
Онбординг — onboarding-grid + card onboarding-card.

Матрицы — card card--soft matrix-card + таблица.

Фильтры/подменю — nav.subnav-lines + data-target/data-section.

Модальные окна — два глобальных поп-апа (квизы и калькуляторы), единый визуальный стиль.

10. Расширение и поддержка
При добавлении новых возможностей:

Новые разделы → новые модули в /js/modules.

Новые калькуляторы → только через /js/calculators + templates.js + модалку в calculators/main.js.

Новые квизы → через JSON в /data/quizzes + реестр.

Запрещено:

возвращать калькуляторы обратно в разделы Support / Implementation / Sales;

дублировать бизнес-логику, которую уже реализует core.js или существующие калькуляторы.

yaml
Копировать код
