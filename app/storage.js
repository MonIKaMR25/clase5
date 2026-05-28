import { STORAGE_KEYS } from "./constants.js";

export function getCapturedSet() {
  const raw = localStorage.getItem(STORAGE_KEYS.CAPTURED);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export function saveCapturedSet(capturedSet) {
  localStorage.setItem(STORAGE_KEYS.CAPTURED, JSON.stringify([...capturedSet]));
}

export function toggleCaptured(pokemonId) {
  const captured = getCapturedSet();
  if (captured.has(pokemonId)) {
    captured.delete(pokemonId);
  } else {
    captured.add(pokemonId);
  }
  saveCapturedSet(captured);
  return captured;
}

export function removeCaptured(pokemonId) {
  const captured = getCapturedSet();
  captured.delete(pokemonId);
  saveCapturedSet(captured);
  return captured;
}

export function getTheme() {
  return localStorage.getItem(STORAGE_KEYS.THEME) || "light";
}

export function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}
