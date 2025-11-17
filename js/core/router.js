document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('content');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  const setActive = (section) => {
    navLinks.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === section);
    });
  };

  const loadSection = (name) => {
    fetch('sections/' + name + '.html?_=' + Date.now())
      .then(r => r.text())
      .then(html => {
        if (!content) return;
        content.innerHTML = html;
        setActive(name);
        if (name === 'support' && window.SupportPage && typeof window.SupportPage.init === 'function') {
          window.SupportPage.init(content);
        }
      })
      .catch(() => {
        if (content) {
          content.innerHTML = '<p>Ошибка загрузки раздела.</p>';
        }
      });
  };

  navLinks.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const section = btn.dataset.section;
      loadSection(section);
    });
  });

  loadSection('dashboard');
});
