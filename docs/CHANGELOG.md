# SM Codex Portal · CHANGELOG

Журнал изменений проекта.  
Формат: Keep a Changelog.

---

[FRONT] Конструктор подключён к n8n-хуку для сохранения и удаления страниц (Шаг 5.3).


[N8N] Проработан workflow constructor/save-page (контракт и шаги для n8n).

[N8N] Описаны webhook-и для конструктора и calc-auth.

[FRONT] Локальная модель конструктора реализована (редактирование в памяти без сохранения в GitHub).

[FRONT] Создан UI конструктора (маршрут #constructor, режим только чтения).

[FRONT] Все страницы переведены на step-by-step отображение через маршрут #page/:slug.

[FRONT] Реализован BlocksRenderer для отображения блоков контента.

[FRONT] Реализован StepRenderer для показа step-by-step страниц.

[FRONT] SPA переведена на чтение данных из GitHub (предзагрузка content/* через ContentService).

[FRONT] Добавлен GitHub API клиент.

[CONTENT] Создан файл calculators.json.

[CONTENT] Создан файл filters.json.

[CONTENT] Создан файл sections.json.

[CONTENT] Перенесён базовый контент разделов в JSON (steps + blocks).

[CONTENT] Добавлен тип блока html для миграции legacy-контента.

[CONTENT] Создана структура контента.

[DOCS] Синхронизация архитектуры проекта.

## [1.3.0] — 2025-XX-XX
### Добавлено
- Создан единый раздел «Калькуляторы».
- Перенесены калькуляторы из Support, Sales и Implementation.
- Добавлена система модальных окон для калькуляторов.
- Добавлены документации: ARCHITECTURE.md, CONTENT_GUIDE.md, PLAN.md.

### Изменено
- Полный рефакторинг структуры калькуляторов.
- Удалены все дубли в шаблонах.
- Обновлена навигация в разделах Sales и Implementation.

---

[N8N] Проработан workflow constructor/save-page (контракт и шаги для n8n).

[N8N] Описаны webhook-и для конструктора и calc-auth.

[FRONT] Локальная модель конструктора реализована (редактирование в памяти без сохранения в GitHub).

[FRONT] Создан UI конструктора (маршрут #constructor, режим только чтения).

[FRONT] Все страницы переведены на step-by-step отображение через маршрут #page/:slug.

[FRONT] Реализован BlocksRenderer для отображения блоков контента.

[FRONT] Реализован StepRenderer для показа step-by-step страниц.

[FRONT] SPA переведена на чтение данных из GitHub (предзагрузка content/* через ContentService).

[FRONT] Добавлен GitHub API клиент.

[CONTENT] Создан файл calculators.json.

[CONTENT] Создан файл filters.json.

[CONTENT] Создан файл sections.json.

[CONTENT] Перенесён базовый контент разделов в JSON (steps + blocks).

[CONTENT] Добавлен тип блока html для миграции legacy-контента.

[CONTENT] Создана структура контента.

[DOCS] Синхронизация архитектуры проекта.

## [1.2.0] — 2025-XX-XX
### Добавлено
- Единый компонент поп-апа для квизов.
- Добавлены новые квизы для Support и Implementation.

---

[N8N] Проработан workflow constructor/save-page (контракт и шаги для n8n).

[N8N] Описаны webhook-и для конструктора и calc-auth.

[FRONT] Локальная модель конструктора реализована (редактирование в памяти без сохранения в GitHub).

[FRONT] Создан UI конструктора (маршрут #constructor, режим только чтения).

[FRONT] Все страницы переведены на step-by-step отображение через маршрут #page/:slug.

[FRONT] Реализован BlocksRenderer для отображения блоков контента.

[FRONT] Реализован StepRenderer для показа step-by-step страниц.

[FRONT] SPA переведена на чтение данных из GitHub (предзагрузка content/* через ContentService).

[FRONT] Добавлен GitHub API клиент.

[CONTENT] Создан файл calculators.json.

[CONTENT] Создан файл filters.json.

[CONTENT] Создан файл sections.json.

[CONTENT] Перенесён базовый контент разделов в JSON (steps + blocks).

[CONTENT] Добавлен тип блока html для миграции legacy-контента.

[CONTENT] Создана структура контента.

[DOCS] Синхронизация архитектуры проекта.

## [1.1.0] — 2025-XX-XX
### Добавлено
- Кейсы для Sales.
- Онбординг для внедрения.
- Матрица ответственности внедрения.

---

[N8N] Проработан workflow constructor/save-page (контракт и шаги для n8n).

[N8N] Описаны webhook-и для конструктора и calc-auth.

[FRONT] Локальная модель конструктора реализована (редактирование в памяти без сохранения в GitHub).

[FRONT] Создан UI конструктора (маршрут #constructor, режим только чтения).

[FRONT] Все страницы переведены на step-by-step отображение через маршрут #page/:slug.

[FRONT] Реализован BlocksRenderer для отображения блоков контента.

[FRONT] Реализован StepRenderer для показа step-by-step страниц.

[FRONT] SPA переведена на чтение данных из GitHub (предзагрузка content/* через ContentService).

[FRONT] Добавлен GitHub API клиент.

[CONTENT] Создан файл calculators.json.

[CONTENT] Создан файл filters.json.

[CONTENT] Создан файл sections.json.

[CONTENT] Перенесён базовый контент разделов в JSON (steps + blocks).

[CONTENT] Добавлен тип блока html для миграции legacy-контента.

[CONTENT] Создана структура контента.

[DOCS] Синхронизация архитектуры проекта.

## [1.0.0] — 2025-XX-XX
### Релиз
- Созданы разделы Support, Sales, Implementation.
- Создан Router и SPA-архитектура.
- Добавлены первые калькуляторы.
