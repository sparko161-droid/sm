document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const btn = document.getElementById('themeToggle');

  const applyTheme = (theme) => {
    body.classList.remove('dark-theme', 'light-theme');
    body.classList.add(theme + '-theme');
    localStorage.setItem('portalTheme', theme);
  };

  const saved = localStorage.getItem('portalTheme') || 'dark';
  applyTheme(saved);

  if (btn) {
    btn.addEventListener('click', () => {
      const next = body.classList.contains('dark-theme') ? 'light' : 'dark';
      applyTheme(next);
    });
  }
});
