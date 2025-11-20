
export const NDFL_RATE = 0.13;

export function formatMoney(value) {
  if (!Number.isFinite(value)) return "0 ₽";
  return Math.round(value).toLocaleString("ru-RU") + " ₽";
}

export function parseNumber(input, fallback = 0) {
  if (!input) return fallback;
  const raw = String(input.value || "").replace(",", ".").trim();
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Вспомогательная функция: повесить обработчик пересчета на набор инпутов.
 * inputs: HTMLElement[]
 * handler: () => void
 */
export function attachAutoRecalc(inputs, handler) {
  if (!Array.isArray(inputs) || typeof handler !== "function") return;
  ["input", "change"].forEach((evt) => {
    inputs.forEach((el) => el && el.addEventListener(evt, handler));
  });
}
