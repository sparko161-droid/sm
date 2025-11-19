
import { initSalesInteractions } from "/sm/js/modules/sales/logic.js";

const SalesPage = {
  name: "sales",

  async init(container) {
    container.innerHTML = `
      <section class="section section--sales">
        <header class="section-header" data-sales-section="top">
          <h2>🏹 Отдел продаж</h2>
          <p class="tagline">
            Хантеры и клиентский отдел: как мы ищем, подключаем и сопровождаем клиентов «Стандарт Мастер».
          </p>
        </header>

        <div class="sales-toolbar">
          <div class="subnav-lines" data-role="sales-nav">
            <button class="subnav-pill active" data-target="top">Общее</button>
            <button class="subnav-pill" data-target="hunters">Хантеры</button>
            <button class="subnav-pill" data-target="clients">Клиентский отдел</button>
            <button class="subnav-pill" data-target="motivation">Мотивация и ZP</button>
            <button class="subnav-pill" data-target="cases">Кейсы и квизы</button>
            <button class="subnav-pill" data-target="onboarding">Онбординг</button>
            <button class="subnav-pill" data-target="matrix">Матрица ответственности</button>
          </div>
        </div>

        <div class="card-grid" data-sales-section="top">
          <article class="card">
            <div class="card-title">Миссия отдела продаж</div>
            <p>
              Приводить в компанию новых подходящих клиентов и развивать действующих так,
              чтобы каждый объект получал максимум ценности от решений iiko и сервиса «Стандарт Мастер».
            </p>
            <ul class="list small">
              <li>Ищем и подключаем новые объекты (хантеры).</li>
              <li>Развиваем существующий портфель и удерживаем выручку (клиентский отдел).</li>
              <li>Работаем в связке с внедрением и поддержкой.</li>
            </ul>
          </article>

          <article class="card card--accent">
            <div class="card-title">Принципы работы</div>
            <ol class="list small">
              <li><strong>Партнёрство, а не «впаривание».</strong> Решаем задачи бизнеса, а не продаём коробку.</li>
              <li><strong>Прозрачность.</strong> Фиксируем договорённости, ожидаемый результат и условия.</li>
              <li><strong>Предсказуемость.</strong> Не бросаем клиента после сделки, выстраиваем цикл «продажа → внедрение → сопровождение».</li>
              <li><strong>Ответственность.</strong> Привели «не того» клиента — проблемы полетят в поддержку и внедрение.</li>
              <li><strong>Командность.</strong> Продажи, внедрение и поддержка играют в одной команде.</li>
            </ol>
          </article>
        </div>

        <hr class="section-divider" />

        <section class="section-block" data-sales-section="hunters">
          <h3>🎯 Хантеры (коммерческий отдел)</h3>
          <p class="tagline small">
            Хантеры отвечают за поиск и подключение новых клиентов, запуск пилотов и расширение продуктовой линейки.
          </p>

          <div class="card-grid">
            <article class="card">
              <div class="card-sub">Что делают хантеры</div>
              <ul class="list small">
                <li>Ищут и квалифицируют новые объекты (рестораны, кофейни, сети).</li>
                <li>Проводят первичные встречи, выявляют потребности и собирают данные.</li>
                <li>Презентуют решения iiko и сервисы «Стандарт Мастер».</li>
                <li>Формируют коммерческие предложения и просчитывают маржу.</li>
                <li>Согласуют условия, помогают клиенту пройти путь до договора.</li>
                <li>Передают объект в внедрение и клиентский отдел.</li>
              </ul>
            </article>

            <article class="card card--soft">
              <div class="card-sub">Чего не делают хантеры</div>
              <ul class="list small">
                <li>Не ведут техническую переписку по инцидентам — это зона поддержки.</li>
                <li>Не настраивают оборудование и iiko — за это отвечает внедрение.</li>
                <li>Не принимают на себя роль аккаунт-менеджера после передачи клиента.</li>
                <li>Не обещают клиенту то, что невозможно реализовать технически или юридически.</li>
              </ul>
            </article>
          </div>

          <div class="card-grid" style="margin-top: 14px;">
            <article class="card">
              <div class="card-title">Воронка хантера</div>
              <ol class="step-list">
                <li><span class="step-index">1</span><span>Лид: входящий запрос / исходящий контакт.</span></li>
                <li><span class="step-index">2</span><span>Квалификация: базовая проверка формата и потенциала.</span></li>
                <li><span class="step-index">3</span><span>Диагностика: встреча, бриф, сбор исходных данных.</span></li>
                <li><span class="step-index">4</span><span>Решение: подготовка КП, просчёт маржи, согласование.</span></li>
                <li><span class="step-index">5</span><span>Договор: подписание, предоплата.</span></li>
                <li><span class="step-index">6</span><span>Передача: постановка задач во внедрение и клиентский отдел.</span></li>
              </ol>
            </article>

            <article class="card card--border">
              <div class="card-title">KPI хантера</div>
              <ul class="list small">
                <li>Выполнение плана по марже.</li>
                <li>План по подпискам (клауд, сервисы).</li>
                <li>Доля выигранных сделок.</li>
                <li>Соблюдение регламента передачи клиента.</li>
                <li>Качество заполнения CRM и карточек клиента.</li>
              </ul>
            </article>
          </div>
        </section>

        <hr class="section-divider" />

        <section class="section-block" data-sales-section="clients">
          <h3>🤝 Клиентский отдел (аккаунт-менеджеры)</h3>
          <p class="tagline small">
            Клиентский отдел отвечает за развитие действующих клиентов: удержание выручки, апселл и сбор платежей.
          </p>

          <div class="card-grid">
            <article class="card">
              <div class="card-sub">Что делает клиентский отдел</div>
              <ul class="list small">
                <li>Принимает клиента после внедрения от хантера и инженеров.</li>
                <li>Контролирует продления лицензий, оплату подписок и ДСО.</li>
                <li>Предлагает дополнительные продукты и услуги по потребности.</li>
                <li>Следит за удовлетворённостью и NPS.</li>
                <li>Работает с рисками оттока и дебиторкой.</li>
              </ul>
            </article>

            <article class="card card--soft">
              <div class="card-sub">Чего не делает клиентский отдел</div>
              <ul class="list small">
                <li>Не решает технические инциденты — это зона поддержки.</li>
                <li>Не проводит сложное внедрение и проектную работу.</li>
                <li>Не изменяет самостоятельно условия договора и прайсы.</li>
              </ul>
            </article>
          </div>

          <div class="card-grid" style="margin-top: 14px;">
            <article class="card">
              <div class="card-title">Основные процессы аккаунта</div>
              <ul class="list small">
                <li>Плановые созвоны с клиентами по портфелю.</li>
                <li>Контроль продлений и оплат.</li>
                <li>Работа с долговыми клиентами.</li>
                <li>Инициирование апселлов и доп. услуг.</li>
                <li>Сбор обратной связи и ревью по сервису.</li>
              </ul>
            </article>

            <article class="card card--border">
              <div class="card-title">KPI клиентского отдела</div>
              <ul class="list small">
                <li>Сохранение и рост выручки по портфелю.</li>
                <li>Сбор ДСО и абонентки.</li>
                <li>Доля продлённых клиентов.</li>
                <li>Количество и качество апселлов.</li>
              </ul>
            </article>
          </div>
        </section>

        <hr class="section-divider" />

        <section class="section-block" data-sales-section="motivation">
          <h3>💰 Мотивация и калькуляторы ZP</h3>
          <p class="tagline small">
            Для прозрачности мотивации сделаны два калькулятора: для хантера и для аккаунт-менеджера. НДФЛ считается только с окладной части.
          </p>

          <div class="card-grid">
            <article class="card" data-calc-sales-hunter>
              <div class="card-title">Калькулятор ZP хантера</div>
              <div class="grid">
                <div>
                  <h4 class="small">Входные данные</h4>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-h-salary">Оклад (₽):</label>
                    <input id="sales-h-salary" type="number" class="calc-input" value="50000" min="0" step="1000" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-h-margin">Маржа за период (₽):</label>
                    <input id="sales-h-margin" type="number" class="calc-input" value="300000" min="0" step="1000" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-h-margin-pct">% с маржи:</label>
                    <input id="sales-h-margin-pct" type="number" class="calc-input" value="5" min="0" max="100" step="0.1" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-h-cloud">Клауд-доход (₽):</label>
                    <input id="sales-h-cloud" type="number" class="calc-input" value="50000" min="0" step="1000" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-h-cloud-pct">% с клауда:</label>
                    <input id="sales-h-cloud-pct" type="number" class="calc-input" value="5" min="0" max="100" step="0.1" />
                  </div>

                  <div class="calc-row">
                    <label class="calc-label" for="sales-h-lk">Личный коэфф. (ЛК):</label>
                    <input id="sales-h-lk" type="number" class="calc-input" value="1" step="0.01" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-h-kk">Командный коэфф. (КК):</label>
                    <input id="sales-h-kk" type="number" class="calc-input" value="1" step="0.01" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-h-ksb">Коэфф. сбора (КСБ):</label>
                    <input id="sales-h-ksb" type="number" class="calc-input" value="1" step="0.01" />
                  </div>

                  <div class="calc-row">
                    <label class="calc-label" for="sales-h-loya">Премия LOYA (₽):</label>
                    <input id="sales-h-loya" type="number" class="calc-input" value="0" min="0" step="1000" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-h-resto">Премия RestoPNL (₽):</label>
                    <input id="sales-h-resto" type="number" class="calc-input" value="0" min="0" step="1000" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-h-other">Другие премии (₽):</label>
                    <input id="sales-h-other" type="number" class="calc-input" value="0" min="0" step="1000" />
                  </div>
                </div>

                <div>
                  <h4 class="small">Результат</h4>
                  <p class="calc-result-highlight" data-output="sales-h-main">
                    Заполните данные, чтобы увидеть расчёт.
                  </p>
                  <div class="calc-result-details" data-output="sales-h-details"></div>
                </div>
              </div>
            </article>

            <article class="card" data-calc-sales-client>
              <div class="card-title">Калькулятор ZP аккаунт-менеджера</div>
              <div class="grid">
                <div>
                  <h4 class="small">Входные данные</h4>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-c-salary">Оклад (₽):</label>
                    <input id="sales-c-salary" type="number" class="calc-input" value="45000" min="0" step="1000" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-c-margin">Маржа за период (₽):</label>
                    <input id="sales-c-margin" type="number" class="calc-input" value="250000" min="0" step="1000" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-c-margin-pct">% с маржи:</label>
                    <input id="sales-c-margin-pct" type="number" class="calc-input" value="3" min="0" max="100" step="0.1" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-c-cloud">Клауд-доход (₽):</label>
                    <input id="sales-c-cloud" type="number" class="calc-input" value="40000" min="0" step="1000" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-c-cloud-pct">% с клауда:</label>
                    <input id="sales-c-cloud-pct" type="number" class="calc-input" value="3" min="0" max="100" step="0.1" />
                  </div>

                  <div class="calc-row">
                    <label class="calc-label" for="sales-c-lk">Личный коэфф. (ЛК):</label>
                    <input id="sales-c-lk" type="number" class="calc-input" value="1" step="0.01" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-c-kk">Командный коэфф. (КК):</label>
                    <input id="sales-c-kk" type="number" class="calc-input" value="1" step="0.01" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-c-ksb">Коэфф. сбора (КСБ):</label>
                    <input id="sales-c-ksb" type="number" class="calc-input" value="1" step="0.01" />
                  </div>

                  <div class="calc-row">
                    <label class="calc-label" for="sales-c-loya">Премия LOYA (₽):</label>
                    <input id="sales-c-loya" type="number" class="calc-input" value="0" min="0" step="1000" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-c-resto">Премия RestoPNL (₽):</label>
                    <input id="sales-c-resto" type="number" class="calc-input" value="0" min="0" step="1000" />
                  </div>
                  <div class="calc-row">
                    <label class="calc-label" for="sales-c-other">Другие премии (₽):</label>
                    <input id="sales-c-other" type="number" class="calc-input" value="0" min="0" step="1000" />
                  </div>
                </div>

                <div>
                  <h4 class="small">Результат</h4>
                  <p class="calc-result-highlight" data-output="sales-c-main">
                    Заполните данные, чтобы увидеть расчёт.
                  </p>
                  <div class="calc-result-details" data-output="sales-c-details"></div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <hr class="section-divider" />

        <section class="section-block" data-sales-section="cases">
          <h3>📚 Кейсы и квизы по отделу продаж</h3>
          <div class="card-grid">
            <article class="card">
              <div class="card-title">Кейс: клиент хочет скидку «прямо сейчас»</div>
              <p class="small">
                Клиент просит существенную скидку уже на первом созвоне. Важно отработать ценность, а не превращать переговоры в торг.
              </p>
              <ul class="list small">
                <li>Уточнить, что именно для клиента важно в решении.</li>
                <li>Показать влияние скидки на сервис и возможности по внедрению.</li>
                <li>Использовать сценарии из речевых модулей, не обещая лишнего.</li>
              </ul>
            </article>

            <article class="card">
              <div class="card-title">Кейс: клиент «завис» после КП</div>
              <p class="small">
                КП отправлено, но клиент не выходит на связь. Хантеру нужно аккуратно вернуть контакт и понять реальное состояние сделки.
              </p>
              <ul class="list small">
                <li>Напомнить о договорённости и ценности решения.</li>
                <li>Уточнить, что мешает принять решение.</li>
                <li>Согласовать следующий конкретный шаг.</li>
              </ul>
            </article>

            <article class="card">
              <div class="card-title">Кейс: клиент не оплачивает продление</div>
              <p class="small">
                У действующего клиента истекает срок лицензии, продление не оплачено. Аккаунту важно не только «выбить платёж», но и сохранить отношения.
              </p>
              <ul class="list small">
                <li>Проверить, доволен ли клиент текущим сервисом.</li>
                <li>Уточнить причины задержки платежа.</li>
                <li>Проговорить последствия неопродления и варианты решения.</li>
              </ul>
            </article>
          </div>

          <div class="card card--soft" style="margin-top: 14px;">
            <div class="card-title">Проверь себя</div>
            <p class="small">
              Для практики можно пройти квизы по работе отдела продаж. Они открываются в отдельной вкладке квизов.
            </p>
            <div class="quiz-actions">
              <a href="#quiz?category=sales&quiz=hunter-routing" class="btn btn-sm">Квиз: маршрутизация для хантера</a>
              <a href="#quiz?category=sales&quiz=client-scope" class="btn btn-sm btn-ghost">Квиз: зона ответственности клиентского отдела</a>
            </div>
          </div>
        </section>

        <hr class="section-divider" />

        <section class="section-block" data-sales-section="onboarding">
          <h3>🎓 Онбординг менеджера по продажам · 3 месяца</h3>
          <p class="tagline small">
            Онбординг строится вокруг практики: от базового понимания продукта до самостоятельного ведения сделок и портфеля.
          </p>

          <div class="card-grid">
            <article class="card">
              <div class="card-title">Месяц 1 — База</div>
              <ul class="list small">
                <li>Знакомство с компанией, продуктами и основными процессами.</li>
                <li>База по iiko, внедрению и поддержке.</li>
                <li>Тренировка скриптов и речевых модулей.</li>
                <li>Первые звонки и встречи под присмотром наставника.</li>
              </ul>
            </article>

            <article class="card">
              <div class="card-title">Месяц 2 — Практика</div>
              <ul class="list small">
                <li>Самостоятельная работа с частью воронки.</li>
                <li>Участие в переговорах, пробные закрытия сделок.</li>
                <li>Подключение к работе с действующими клиентами.</li>
              </ul>
            </article>

            <article class="card">
              <div class="card-title">Месяц 3 — Ответственность</div>
              <ul class="list small">
                <li>Полноценное ведение воронки (для хантера) или портфеля (для аккаунта).</li>
                <li>Работа по личным KPI по марже, клауду и сбору.</li>
                <li>Подготовка к внутренней сертификации и закреплению уровня.</li>
              </ul>
            </article>
          </div>
        </section>

        <hr class="section-divider" />

        <section class="section-block" data-sales-section="matrix">
          <h3>🧩 Матрица ответственности: продажи, внедрение, поддержка</h3>
          <div class="card card--soft">
            <div class="table-wrapper">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Процесс</th>
                    <th>Хантеры</th>
                    <th>Клиентский отдел</th>
                    <th>Внедрение</th>
                    <th>Поддержка</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Поиск и первичные контакты</td>
                    <td>✔</td>
                    <td>–</td>
                    <td>–</td>
                    <td>–</td>
                  </tr>
                  <tr>
                    <td>Подготовка и согласование КП</td>
                    <td>✔</td>
                    <td>–</td>
                    <td>По запросу</td>
                    <td>По запросу</td>
                  </tr>
                  <tr>
                    <td>Подписание договора</td>
                    <td>✔</td>
                    <td>–</td>
                    <td>–</td>
                    <td>–</td>
                  </tr>
                  <tr>
                    <td>Постановка задач на внедрение</td>
                    <td>✔</td>
                    <td>–</td>
                    <td>✔</td>
                    <td>–</td>
                  </tr>
                  <tr>
                    <td>Проектное внедрение</td>
                    <td>–</td>
                    <td>–</td>
                    <td>✔</td>
                    <td>–</td>
                  </tr>
                  <tr>
                    <td>Сопровождение 30 дней после пуска</td>
                    <td>–</td>
                    <td>–</td>
                    <td>✔</td>
                    <td>✔</td>
                  </tr>
                  <tr>
                    <td>Дальнейшее сопровождение</td>
                    <td>–</td>
                    <td>✔</td>
                    <td>–</td>
                    <td>✔</td>
                  </tr>
                  <tr>
                    <td>Продления и сбор ДСО</td>
                    <td>–</td>
                    <td>✔</td>
                    <td>–</td>
                    <td>–</td>
                  </tr>
                  <tr>
                    <td>Инцидентная поддержка</td>
                    <td>–</td>
                    <td>–</td>
                    <td>–</td>
                    <td>✔</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <p class="glossary-note small">
          * <strong>Маржа</strong> — доход компании по сделке за вычетом прямых затрат;
          <strong>клауд</strong> — облачные подписки и сервисы;
          <strong>ЛК</strong> — личный коэффициент выполнения плана;
          <strong>КК</strong> — командный коэффициент выполнения плана;
          <strong>КСБ</strong> — коэффициент качества сбора платежей;
          <strong>ДСО</strong> — дополнительное сервисное обслуживание.
        </p>
      </section>
    `;

    initSalesInteractions(container);
  },

  destroy() {}
};

export default SalesPage;
