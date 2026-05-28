import { initRouter } from "./router.js";
import { getTheme, saveTheme } from "./storage.js";

const app = {
  root: document.querySelector("#app"),
  pokemonList: [],
  availableTypes: ["all"],
  searchQuery: "",
  selectedType: "all",
  bindThemeToggle: () => {},
};

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  saveTheme(nextTheme);
}

function setupTheme() {
  applyTheme(getTheme());

  app.bindThemeToggle = () => {
    const toggleButton = app.root.querySelector("#theme-toggle");
    if (!toggleButton) return;

    toggleButton.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains("dark");
      applyTheme(isDark ? "light" : "dark");
    });
  };
}

setupTheme();
initRouter(app);
