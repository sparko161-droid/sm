# SM Codex Portal · N8N_INTEGRATION

Этот документ описывает интеграцию портала с n8n:

- авторизация доступа к калькуляторам и конструктору;
- запись изменений в GitHub (content/*);
- структуру webhook-ов и ожидаемых payload-ов.

---

## 1. Общий принцип

Все записи в GitHub выполняются через n8n.

Цепочка:

```text
SPA → n8n Webhook → GitHub API → commit в репозиторий
```

n8n:

- принимает HTTP-запросы от SPA;
- валидирует данные;
- проверяет права доступа;
- читает/обновляет файлы через GitHub API;
- возвращает SPA структурированный ответ.

Секреты и токены GitHub хранятся **только в n8n**.

---

## 2. Webhook-и конструктора

Планируемые webhook-и:

1. `/webhook/constructor/auth`
2. `/webhook/constructor/save-page`
3. `/webhook/constructor/save-sections`
4. `/webhook/constructor/save-filters`

### 2.1. /webhook/constructor/auth

Используется при входе в конструктор.

**Запрос (SPA → n8n):**

```json
{
  "password": "string"
}
```

**Ответ (n8n → SPA, пример):**

```json
{
  "success": true,
  "authorized": true,
  "sessionId": "session-xyz",
  "expiresInSec": 3600
}
```

При ошибке:

```json
{
  "success": false,
  "authorized": false,
  "errorCode": "AUTH_FAILED",
  "message": "Неверный пароль."
}
```

SPA хранит только `sessionId` и отправляет его в заголовках/теле других запросов.

---

### 2.2. /webhook/constructor/save-page

Используется для сохранения одной страницы (`content/pages/**/*.json`).

**Запрос:**

```json
{
  "sessionId": "session-xyz",
  "pagePath": "support/overview.json",
  "pageData": { /* JSON страницы, как в CONTENT_MODEL.md */ },
  "sha": "prev-file-sha-or-null",
  "commitMessage": "Update support overview page via constructor"
}
```

**Действия n8n:**

1. Проверяет `sessionId` → авторизация.
2. Считывает текущий файл из GitHub (`GET /contents`).
3. При необходимости сверяет `sha`.
4. Обновляет файл (`PUT /contents`) с новым содержимым.
5. Возвращает новый `sha`.

**Ответ:**

```json
{
  "success": true,
  "newSha": "new-file-sha",
  "filePath": "content/pages/support/overview.json"
}
```

При ошибке:

```json
{
  "success": false,
  "errorCode": "CONFLICT",
  "message": "Файл был изменён другим пользователем.",
  "details": {}
}
```

---

### 2.3. /webhook/constructor/save-sections

Сохраняет `content/sections.json`.

**Запрос:**

```json
{
  "sessionId": "session-xyz",
  "sections": { "sections": [ /* ... */ ] },
  "sha": "prev-sections-sha",
  "commitMessage": "Update sections.json via constructor"
}
```

**Ответ:**

```json
{
  "success": true,
  "newSha": "new-sections-sha"
}
```

---

### 2.4. /webhook/constructor/save-filters

Аналогично `save-sections`, но для `content/filters.json`.

**Запрос:**

```json
{
  "sessionId": "session-xyz",
  "filters": { /* структура как в CONTENT_MODEL.md */ },
  "sha": "prev-filters-sha",
  "commitMessage": "Update filters.json via constructor"
}
```

**Ответ:**

```json
{
  "success": true,
  "newSha": "new-filters-sha"
}
```

---

## 3. Webhook calc-auth (доступ к калькуляторам)

Webhook:

```text
/webhook/calc-auth
```

Используется на странице калькулятора.

**Запрос:**

```json
{
  "calculatorId": "l1-support",
  "password": "string"
}
```

**Ответ (пример):**

```json
{
  "success": true,
  "allowed": true
}
```

или

```json
{
  "success": false,
  "allowed": false,
  "errorCode": "AUTH_FAILED",
  "message": "Неверный пароль."
}
```

SPA:

- не хранит пароль;
- сохраняет только факт `allowed: true` на время сессии (например, в памяти).

---

## 4. Примечания по реализации workflow-ов

Внутренняя детализация n8n workflow-ов:

- может включать:
  - `Webhook` node;
  - `Function` node для валидации;
  - `HTTP Request` к GitHub API;
  - `IF` / `Switch` для ветвлений;
  - `Set` / `Merge` для сборки ответа;
  - узлы логирования (настроенные в инфраструктуре).
- не описывается в репозитории подробно, чтобы не привязываться к конкретной инсталляции.

Главное:

- интерфейс webhook-ов (вход/выход) должен оставаться стабильным;
- любые изменения интерфейса должны сопровождаться:
  - обновлением этого документа;
  - обновлением фронтенда;
  - записью в `CHANGELOG.md` с типом `[N8N]`.

---

## 5. Безопасность

- токены GitHub и пароли не должны попадать в логи фронтенда;
- SPA должен минимизировать количество данных, отправляемых в n8n;
- все ошибки, возвращаемые n8n, должны отображаться в UI человекопонятно,
  но без раскрытия внутренних деталей инфраструктуры.

Интеграция с n8n — критический слой между SPA и GitHub backend
и должна поддерживаться в строго согласованном состоянии с архитектурой проекта.

# 3. Webhook-и для конструктора и калькуляторов

Ниже описаны целевые webhook-и n8n, через которые SPA будет записывать изменения
в GitHub backend и проверять доступ к калькуляторам.

Все URL условные (пример), на практике задаются в настройках n8n / окружении.

## 3.1. `/webhook/constructor/save-page`

Назначение: сохранить изменения одной страницы (`content/pages/{pagePath}`).

**Метод:** `POST`  
**Тело запроса (JSON):**

```json
{
  "pagePath": "support/main.json",
  "pageJson": { "...": "полный JSON страницы в формате CONTENT_MODEL.md" },
  "sha": "abc123",
  "commitMessage": "Update support main page via constructor",
  "author": {
    "id": "optional-human-or-automation-id",
    "source": "constructor-ui"
  }
}
```

Где:

- `pagePath` — относительный путь внутри `content/pages/`;
- `pageJson` — полное содержимое страницы (steps + blocks);
- `sha` — текущий SHA-файла из GitHub (для защиты от гонок);
- `commitMessage` — текст коммита;
- `author` — метаданные об инициаторе изменения (опционально).

**Ответ (успешный):**

```json
{
  "ok": true,
  "pagePath": "support/main.json",
  "sha": "new-sha-value",
  "committedAt": "2025-01-01T12:34:56.000Z"
}
```

n8n-workflow:

1. Принимает JSON.
2. Проверяет права (при необходимости — через отдельный шаг авторизации).
3. Делает запрос к GitHub Contents API (`PUT /repos/{owner}/{repo}/contents/{path}`).
4. Возвращает новый `sha` и метаданные операции.

## 3.2. `/webhook/constructor/save-sections`

Назначение: сохранить `content/sections.json` после изменений структуры разделов/страниц.

**Метод:** `POST`  
**Тело запроса (JSON):**

```json
{
  "sectionsJson": { "sections": [ /* ... */ ] },
  "sha": "abc123",
  "commitMessage": "Update sections structure via constructor",
  "author": {
    "id": "optional-human-or-automation-id",
    "source": "constructor-ui"
  }
}
```

**Ответ (успешный):**

```json
{
  "ok": true,
  "sha": "new-sha-value",
  "committedAt": "2025-01-01T12:34:56.000Z"
}
```

n8n-workflow:

1. Принимает `sectionsJson` и текущий `sha`.
2. Сериализует JSON в строку.
3. Обновляет файл `content/sections.json` в репозитории.
4. Возвращает новый `sha`.

## 3.3. `/webhook/constructor/save-filters`

Назначение: сохранить `content/filters.json` после редактирования фильтров в конструкторе.

**Метод:** `POST`  
**Тело запроса (JSON):**

```json
{
  "filtersJson": {
    "lines": [ /* ... */ ],
    "caseTypes": [ /* ... */ ],
    "categories": [ /* ... */ ]
  },
  "sha": "abc123",
  "commitMessage": "Update filters via constructor",
  "author": {
    "id": "optional-human-or-automation-id",
    "source": "constructor-ui"
  }
}
```

**Ответ (успешный):**

```json
{
  "ok": true,
  "sha": "new-sha-value",
  "committedAt": "2025-01-01T12:34:56.000Z"
}
```

n8n-workflow:

1. Принимает новый JSON фильтров.
2. Обновляет `content/filters.json` через GitHub API.
3. Возвращает новый `sha`.

## 3.4. `/webhook/calc-auth`

Назначение: проверить пароль для доступа к калькулятору (страница `/calc/:slug`).

**Метод:** `POST`  
**Тело запроса (JSON):**

```json
{
  "calculatorId": "l1",
  "password": "user-input-secret"
}
```

**Ответ (успешный):**

```json
{
  "ok": true,
  "allowed": true,
  "calculatorId": "l1"
}
```

Или при неверном пароле:

```json
{
  "ok": true,
  "allowed": false,
  "calculatorId": "l1"
}
```

n8n-workflow:

1. Принимает `calculatorId` и `password`.
2. Сверяет пароль с хранилищем (Vault/переменные среды/таблица), но **никогда** не отдаёт его на клиент.
3. Возвращает флаг `allowed`.
4. Дополнительно может логировать попытки (id пользователя, время, calculatorId).

## 4. Workflow `constructor/save-page` (n8n)

Этот workflow реализуется в n8n и привязан к webhook `/webhook/constructor/save-page`.

Задача: принять JSON страницы от SPA, записать файл в GitHub через Contents API и вернуть новый `sha`.

### 4.1. Ожидаемый контракт (повтор)

**Метод:** `POST`  
**Тело запроса (JSON):**

```json
{
  "pagePath": "support/main.json",
  "pageJson": { "...": "полный JSON страницы" },
  "sha": "abc123",
  "commitMessage": "Update support main page via constructor",
  "author": {
    "id": "optional-human-or-automation-id",
    "source": "constructor-ui"
  }
}
```

**Ответ (успех):**

```json
{
  "ok": true,
  "pagePath": "support/main.json",
  "sha": "new-sha-value",
  "committedAt": "2025-01-01T12:34:56.000Z"
}
```

### 4.2. Рекомендуемая структура workflow в n8n

Минимальный набор нод:

1. **Webhook (Trigger)**  
   - Method: `POST`  
   - Response mode: `Last node` или `On Received` (по выбору)  
   - Response content type: `application/json`.

2. **Function (Prepare GitHub payload)**  
   JavaScript-пример внутри ноды:

   ```js
   const body = items[0].json;

   if (!body.pagePath || !body.pageJson) {
     throw new Error('Missing pagePath or pageJson');
   }

   const pagePath = body.pagePath;
   const sha = body.sha || undefined;
   const commitMessage = body.commitMessage || `Update ${pagePath} via constructor`;

   // Строка файла = JSON страницы с отступами
   const fileContent = JSON.stringify(body.pageJson, null, 2);

   // GitHub Contents API ждёт base64-кодирование
   const base64Content = Buffer.from(fileContent, 'utf8').toString('base64');

   return [
     {
       json: {
         pagePath,
         sha,
         commitMessage,
         content: base64Content
       }
     }
   ];
   ```

3. **HTTP Request (GitHub Contents API)**  
   (или специальный GitHub node, если используется встроенная интеграция)

   - Method: `PUT`
   - URL: `https://api.github.com/repos/{{OWNER}}/{{REPO}}/contents/content/pages/{{$json["pagePath"]}}`
   - Headers:
     - `Authorization: Bearer {{GITHUB_TOKEN}}`
     - `User-Agent: n8n-sm-constructor`
     - `Accept: application/vnd.github.v3+json`
   - Body (JSON):

   ```json
   {
     "message": "{{$json["commitMessage"]}}",
     "content": "{{$json["content"]}}",
     "sha": "{{$json["sha"]}}"
   }
   ```

   Переменные `OWNER`, `REPO`, `GITHUB_TOKEN` — из Creds/variables n8n.

4. **Function (Normalize response)**  
   Пример кода:

   ```js
   const gh = items[0].json;

   const out = {
     ok: true,
     pagePath: $json.pagePath || null,
     sha: gh.content && gh.content.sha ? gh.content.sha : gh.commit && gh.commit.sha ? gh.commit.sha : null,
     committedAt: gh.commit && gh.commit.committer && gh.commit.committer.date
       ? gh.commit.committer.date
       : new Date().toISOString()
   };

   return [{ json: out }];
   ```

### 4.3. Ошибки и статусы

- При любой ошибке (валидация входных данных, ошибка GitHub) workflow должен возвращать:
  - HTTP статус 4xx/5xx,
  - JSON вида:
    ```json
    { "ok": false, "error": "Human-readable message" }
    ```
- SPA ожидает:
  - `ok === true` и поле `sha` при успехе;
  - `ok === false` и `error` при ошибке.

### 4.4. Безопасность

- Авторизация к GitHub должна выполняться **только** на стороне n8n (token скрыт от клиента).
- При необходимости можно добавить:
  - IP allowlist для webhook;
  - дополнительный `X-API-Key` в заголовках запроса от SPA;
  - логирование автора (`author.id`, `author.source`).

### 4.x. Webhook `/calc-auth` (для калькуляторов)

URL (пример): `https://jolikcisout.beget.app/webhook-test/sm/calc-auth`  
Метод: `POST`.

Ожидаемый payload от SPA:

```json
{
  "op": "calc-auth",
  "slug": "l2-salary",
  "password": "секретный-пароль"
}
```

Ответ n8n:

```json
{
  "ok": true,
  "allowed": true,
  "slug": "l2-salary"
}
```

При отказе:

```json
{
  "ok": true,
  "allowed": false,
  "slug": "l2-salary",
  "reason": "Неверный пароль"
}
```

При ошибке самого workflow:

```json
{
  "ok": false,
  "error": "Calc-auth internal error"
}
```
