export function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatNumber(id) {
  return `#${String(id).padStart(3, "0")}`;
}

export function parseIdFromUrl(url) {
  const chunks = url.split("/").filter(Boolean);
  return Number(chunks[chunks.length - 1]);
}

export function debounce(fn, wait = 250) {
  let timerId;
  return (...args) => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => fn(...args), wait);
  };
}

export async function mapWithConcurrency(items, mapper, concurrency = 10) {
  const result = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const idx = cursor;
      cursor += 1;
      result[idx] = await mapper(items[idx], idx);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return result;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
