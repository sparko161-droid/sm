export function parseHashQuery() {
  const hash = window.location.hash;
  const [, queryString] = hash.split("?");
  if (!queryString) return {};
  return Object.fromEntries(new URLSearchParams(queryString).entries());
}

export function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}
