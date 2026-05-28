import { appShell } from "./ui.js";
import { renderBattle } from "./views/battle.js";
import { renderDetail } from "./views/detail.js";
import { renderHome } from "./views/home.js";
import { renderMyPokedex } from "./views/myPokedex.js";

function getRouteData() {
  const hash = window.location.hash || "#/";
  const route = hash.replace("#", "");

  if (route === "/" || route === "") {
    return { name: "home", params: {} };
  }
  if (route === "/battle") {
    return { name: "battle", params: {} };
  }
  if (route === "/my-pokedex") {
    return { name: "dex", params: {} };
  }

  const pokemonMatch = route.match(/^\/pokemon\/([^/]+)$/);
  if (pokemonMatch) {
    return { name: "pokemon", params: { id: pokemonMatch[1] } };
  }

  return { name: "not-found", params: {} };
}

function renderNotFound(app) {
  const container = app.root.querySelector("#view-slot");
  container.innerHTML = `
    <section class="rounded-2xl bg-red-100 p-6 text-center text-sm font-bold text-red-700 dark:bg-red-900/40 dark:text-red-100">
      Ruta no encontrada. Regresa a <a class="underline" href="#/">Inicio</a>.
    </section>
  `;
}

export async function renderRoute(app) {
  const routeData = getRouteData();

  app.root.innerHTML = appShell({
    activeRoute: routeData.name,
    content: '<div id="view-slot"></div>',
  });

  if (routeData.name === "home") {
    await renderHome(app);
  } else if (routeData.name === "pokemon") {
    await renderDetail(app, routeData.params.id);
  } else if (routeData.name === "battle") {
    await renderBattle(app);
  } else if (routeData.name === "dex") {
    await renderMyPokedex(app);
  } else {
    renderNotFound(app);
  }

  app.bindThemeToggle();
}

export function initRouter(app) {
  const onRouteChange = () => {
    renderRoute(app);
  };

  window.addEventListener("hashchange", onRouteChange);
  onRouteChange();
}
