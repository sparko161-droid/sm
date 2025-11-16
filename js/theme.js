// theme.js
(function() {
  const key = 'sm-support-theme';
  const root = document.body;

  function applyTheme(value) {
    if (value === 'light') {
      root.classList.remove('dark-theme');
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
      root.classList.add('dark-theme');
      value = 'dark';
    }
    localStorage.setItem(key, value);
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = value === 'light' ? '🌙' : '☀️';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem(key);
    applyTheme(saved || 'dark');

    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const current = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        applyTheme(current === 'light' ? 'dark' : 'light');
      });
    }
  });
})();
