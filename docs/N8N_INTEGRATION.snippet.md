### 4.x. Webhook `/calc-auth` (для калькуляторов)

URL (пример): `https://jolikcisout.beget.app/webhook/sm/calc-auth`  
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
