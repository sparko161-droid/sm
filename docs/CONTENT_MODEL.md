# SM Codex Portal · CONTENT_MODEL

Этот документ описывает **формат данных**, используемый в директории `content/` 
для работы конструктора и портала в целом.

Он является обязательной спецификацией для всех ИИ-агентов и разработчиков.

---

## 1. Обзор content/

Структура директории:

```text
content/
  sections.json        # реестр разделов и страниц
  filters.json         # конфигурация фильтров
  calculators.json     # декларация калькуляторов
  pages/
    support/
      onboarding.json
      cases.json
      ...
    implementation/
    sales/
    operations/
```

Все файлы — валидный JSON в кодировке UTF-8.

---

## 2. sections.json

Файл `content/sections.json` описывает список разделов и их страниц.

### Структура

```json
{
  "sections": [
    {
      "id": "support",
      "slug": "support",
      "title": "Поддержка",
      "order": 1,
      "pages": [
        {
          "id": "support-overview",
          "slug": "support-overview",
          "title": "Обзор поддержки",
          "order": 1,
          "pagePath": "support/overview.json"
        }
      ]
    }
  ]
}
```

### Поля

- `id` — строковый идентификатор раздела (stable, используется в коде).
- `slug` — человекочитаемый URL-кусок для роутинга (`#section/support` и т.п.).
- `title` — название раздела для UI.
- `order` — порядок сортировки в меню.
- `pages[]` — массив страниц этого раздела.

Для каждой страницы:

- `id` — уникальный идентификатор страницы.
- `slug` — часть URL (`#page/support-overview`).
- `title` — название страницы.
- `order` — порядок в рамках раздела.
- `pagePath` — относительный путь к JSON-файлу страницы внутри `content/pages/`.

---

## 3. Формат страниц: pages/**/*.json

Каждая страница хранится в отдельном файле по пути `content/pages/{section}/{page}.json`.

### Структура страницы

```json
{
  "id": "support-overview",
  "sectionId": "support",
  "slug": "support-overview",
  "title": "Обзор поддержки",
  "description": "Краткое описание назначения страницы.",
  "tags": ["support", "overview"],
  "steps": [
    {
      "id": "step-1",
      "title": "Кто такие L1 и L2",
      "description": "Краткое введение.",
      "blocks": [
        {
          "id": "b1",
          "type": "text",
          "data": {
            "title": "Роль L1",
            "text": "L1 — это первая линия поддержки..."
          }
        }
      ]
    }
  ]
}
```

### Обязательные поля

- `id`, `sectionId`, `slug`, `title`, `steps[]`.

### Необязательные поля

- `description`, `tags[]`.

---

## 4. Блоки (blocks[])

Каждый шаг содержит массив блоков.  
Блок имеет общие поля:

- `id` — уникальный идентификатор внутри страницы.
- `type` — тип блока (строка).
- `data` — объект с полями, зависящими от типа.

### 4.1. Тип `text`

```json
{
  "id": "b1",
  "type": "text",
  "data": {
    "title": "Заголовок (опционально)",
    "text": "Основной текст блока, может быть многострочным."
  }
}
```

### 4.2. Тип `list`

```json
{
  "id": "b2",
  "type": "list",
  "data": {
    "title": "Пункты",
    "items": [
      "Пункт 1",
      "Пункт 2"
    ]
  }
}
```

### 4.3. Тип `checklist`

```json
{
  "id": "b3",
  "type": "checklist",
  "data": {
    "title": "Чек-лист",
    "items": [
      { "text": "Сделать X", "required": true },
      { "text": "Сделать Y", "required": false }
    ]
  }
}
```

### 4.4. Тип `case`

```json
{
  "id": "b4",
  "type": "case",
  "data": {
    "title": "Кейс: клиент не может зайти в систему",
    "problem": "Описание ситуации...",
    "analysis": "Как думаем...",
    "solution": "Что делаем по шагам...",
    "line": "L1",
    "caseType": "technical"
  }
}
```

### 4.5. Тип `note`

```json
{
  "id": "b5",
  "type": "note",
  "data": {
    "style": "info",
    "text": "Важно: всегда уведомляйте клиента о сроках."
  }
}
```

### 4.6. Тип `link`

```json
{
  "id": "b6",
  "type": "link",
  "data": {
    "label": "Перейти к регламенту L1",
    "url": "#page/support-reglament-l1"
  }
}
```

### 4.7. Тип `image`

```json
{
  "id": "b7",
  "type": "image",
  "data": {
    "src": "/assets/schemes/support-flow.png",
    "alt": "Схема работы поддержки"
  }
}
```

### 4.8. Тип `calc-link`
### 4.9. Тип `html`

Тип для хранения мигрированного legacy-контента в виде готовой HTML-разметки.
Используется как временный слой при переходе на модель шагов и блоков.

```json
{
  "id": "b9",
  "type": "html",
  "data": {
    "html": "<section class=\"section\">...полная разметка страницы...</section>"
  }
}
```

Рекомендуется постепенно декомпозировать такие блоки в более структурированные типы (`text`, `list`, `case`, ...)
по мере развития конструктора.


```json
{
  "id": "b8",
  "type": "calc-link",
  "data": {
    "calculatorId": "l1-support",
    "label": "Открыть калькулятор мотивации L1"
  }
}
```

---

## 5. filters.json

Файл `content/filters.json` описывает фильтры, доступные в портале.

Пример:

```json
{
  "lines": [
    { "id": "L1", "label": "L1 — Первая линия" },
    { "id": "L2", "label": "L2 — Вторая линия" },
    { "id": "L3", "label": "L3 — Архитектура" }
  ],
  "caseTypes": [
    { "id": "account", "label": "Учётные" },
    { "id": "technical", "label": "Технические" },
    { "id": "integration", "label": "Интеграционные" },
    { "id": "rare", "label": "Редкие (L3)" }
  ]
}
```

В дальнейшем структура может быть расширена,
но базовые поля должны сохраняться для обратной совместимости.

---

## 6. calculators.json

Файл `content/calculators.json` описывает все калькуляторы портала.

Пример:

```json
{
  "calculators": [
    {
      "id": "l1-support",
      "slug": "l1-support",
      "title": "Калькулятор мотивации L1",
      "description": "Расчёт мотивационной части ЗП L1 поддержки.",
      "n8nCalcId": "calc-l1-support-v1"
    }
  ]
}
```

Поля:

- `id` — внутренний идентификатор, используется в блоках `calc-link`.
- `slug` — часть URL (`#calc/l1-support`).
- `title` — название для UI.
- `description` — краткое описание для пользователя.
- `n8nCalcId` — идентификатор, используемый n8n для связи с конкретным workflow.

---

## 7. Версионирование и изменения

Любые изменения в структуре `content/` должны:

- быть согласованы с `ARCHITECTURE_GITHUB_BACKEND.md`;
- сопровождаться обновлением этого документа (при изменении схемы);
- фиксироваться в `CHANGELOG.md` отдельной строкой `[CONTENT] ...`.

Эта модель контента является **единым источником правды** для всех агентов и разработчиков.
