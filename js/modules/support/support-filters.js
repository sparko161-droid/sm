const SupportFilters = {
  init(containerElement) {
    const container = containerElement;
    if (!container) return;

    // Главное меню фильтров по линиям поддержки
    const nav = container.querySelector('.subnav-lines[data-role="support-main-nav"]');
    const navPills = nav ? Array.from(nav.querySelectorAll('.subnav-pill[data-line-filter]')) : [];

    // Все элементы, которые могут триггерить фильтр (например, кнопка "К онбордингу")
    const triggers = Array.from(container.querySelectorAll('[data-line-filter]'));

    // Все блоки линий поддержки (включая онбординг и матрицу)
    const blocks = Array.from(container.querySelectorAll('.support-line[data-line]'));
    if (!triggers.length || !blocks.length) return;

    const applyFilter = (value) => {
      const target = value || 'all';

      blocks.forEach((block) => {
        const line = block.dataset.line || 'all';
        const shouldShow = target === 'all' || line === target;

        block.hidden = !shouldShow;
        block.classList.toggle('support-line--hidden', !shouldShow);
      });

      const firstVisible = blocks.find((b) => !b.hidden);
      if (firstVisible) {
        try {
          firstVisible.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (e) {
          // старые браузеры могут не поддерживать поведение scrollIntoView с опциями
          firstVisible.scrollIntoView(true);
        }
      }
    };

    const handleClick = (trigger, event) => {
      event.preventDefault();
      const value = trigger.dataset.lineFilter || 'all';

      // Активное состояние только на главной навигации
      navPills.forEach((pill) => {
        pill.classList.toggle('active', pill.dataset.lineFilter === value);
      });

      applyFilter(value);
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', handleClick.bind(null, trigger));
    });

    // Стартовое состояние — по активной пилюле в основном меню или "all"
    const activePill = navPills.find((p) => p.classList.contains('active'));
    applyFilter(activePill ? activePill.dataset.lineFilter : 'all');
  }
};

export default SupportFilters;
