export const Theme = {
  key: "sm_theme",

  init() {
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    const systemPrefersDark = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const stored = localStorage.getItem(this.key);
    const initial = stored || (systemPrefersDark ? "dark" : "light");

    document.documentElement.dataset.theme = initial;

    toggle.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem(this.key, next);
    });
  }
};
