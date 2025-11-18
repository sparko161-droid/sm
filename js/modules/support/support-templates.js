const SupportTemplates = {
  init(containerElement) {
    const section = containerElement?.querySelector('.support-line[data-line="templates"]');
    if (!section) return;
    this.initFilters(section);
    this.initCopy(section);
  },

  initFilters(section) {
    const pills = Array.from(section.querySelectorAll('[data-template-filter]'));
    const blocks = Array.from(section.querySelectorAll('[data-template-tags]'));
    if (!pills.length || !blocks.length) return;

    const apply = (filterValue) => {
      blocks.forEach((block) => {
        const tags = (block.dataset.templateTags || '')
          .split(/\s+/)
          .filter(Boolean);
        const isVisible = filterValue === 'all' || tags.includes(filterValue);
        block.style.display = isVisible ? '' : 'none';
      });
    };

    const initial =
      pills.find((pill) => pill.classList.contains('active'))?.dataset.templateFilter || 'all';

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const value = pill.dataset.templateFilter;
        pills.forEach((p) => p.classList.toggle('active', p === pill));
        apply(value);
      });
    });

    apply(initial);
  },

  initCopy(section) {
    const buttons = Array.from(section.querySelectorAll('.template-copy'));
    if (!buttons.length) return;

    const fallbackCopy = (text, button, originalLabel) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.warn('Copy failed', err);
      }
      document.body.removeChild(textarea);
      button.textContent = 'Скопировано!';
      setTimeout(() => {
        button.textContent = originalLabel;
      }, 1200);
    };

    buttons.forEach((button) => {
      const originalLabel = button.textContent || 'Скопировать';
      button.addEventListener('click', () => {
        const targetId = button.dataset.templateTarget;
        if (!targetId) return;
        const templateNode = section.querySelector('[data-template-id="' + targetId + '"]');
        if (!templateNode) return;

        const text = templateNode.textContent || '';

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(text)
            .then(() => {
              button.textContent = 'Скопировано!';
              setTimeout(() => {
                button.textContent = originalLabel;
              }, 1200);
            })
            .catch(() => fallbackCopy(text, button, originalLabel));
        } else {
          fallbackCopy(text, button, originalLabel);
        }
      });
    });
  }
};

export default SupportTemplates;
