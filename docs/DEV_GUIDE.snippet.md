## 9. Страница калькулятора `/calc/:slug` (Шаг 7.1)

Маршрут (рекомендуемый):

```text
#calc/<slug>
```

Модуль: `js/modules/calc/main.js`.

Логика:

- загружаем `content/calculators.json` через `ContentService.loadCalculators()` (GitHub backend);
- находим калькулятор по `slug`;
- показываем:
  - заголовок и описание;
  - форму ввода пароля;
- при сабмите формы:
  - вызываем `authCalc(slug, password)` из `js/api/calcAuthApi.js`;
  - ждём ответ от n8n `/calc-auth`;
  - при `allowed = true` показываем секцию `<section class="calc-body">` — оболочку для самого калькулятора.

Сама реализация формул/логики калькуляторов живёт отдельно (другой модуль/iframe/n8n и т.п.).
На шаге 7.1 мы реализуем только страницу доступа и вызов calc-auth.
