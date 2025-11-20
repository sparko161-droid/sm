export const Theme = {
  key: "sm_theme",

  apply(theme) {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = theme;
    document.body.classList.toggle("dark-theme", isDark);
    document.body.classList.toggle("light-theme", !isDark);
  },

  init() {
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    const systemPrefersDark = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const stored = localStorage.getItem(this.key);
    const initial = stored || (systemPrefersDark ? "dark" : "light");

    this.apply(initial);

    toggle.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      this.apply(next);
      localStorage.setItem(this.key, next);
    });
  }
};
