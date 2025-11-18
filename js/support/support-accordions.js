window.SupportAccordions = {
  init(containerElement) {
    const toggles = Array.from(containerElement?.querySelectorAll('[data-accordion-target]') || []);
    toggles.forEach(toggle => {
      const target = toggle.getAttribute('data-accordion-target');
      const panel = containerElement?.querySelector('[data-accordion="' + target + '"]');
      if (!panel) return;
      toggle.addEventListener('click', () => {
        panel.classList.toggle('open');
      });
    });
  }
};
