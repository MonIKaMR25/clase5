import { fetchPokemonList } from "../api.js";
import { POKEMON_LIMIT } from "../constants.js";
import { pokemonCard, skeletonCards } from "../ui.js";
import { capitalize, debounce } from "../utils.js";

function getFiltered(list, searchText, selectedType) {
  const query = searchText.trim().toLowerCase();
  return list.filter((pokemon) => {
    const byName = !query || pokemon.name.includes(query);
    const byType = selectedType === "all" || pokemon.types.includes(selectedType);
    return byName && byType;
  });
}

export async function renderHome(app) {
  app.root.querySelector("#view-slot").innerHTML = `
    <section class="space-y-5">
      <div class="glass fade-in rounded-2xl border border-white/50 p-4 shadow-sm dark:border-slate-700/60">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h1 class="text-2xl font-display text-orange-500">Pokedex Viva</h1>
          <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-orange-700 dark:bg-orange-900/40 dark:text-orange-100">${POKEMON_LIMIT} Pokemon</span>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <label class="space-y-1">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Buscar por nombre</span>
            <input id="search-input" value="${app.searchQuery}" type="text" placeholder="Ejemplo: pikachu" class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none ring-orange-400 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label class="space-y-1">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Filtrar por tipo</span>
            <select id="type-select" class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none ring-cyan-400 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900">
              ${app.availableTypes
                .map((type) => `<option value="${type}" ${app.selectedType === type ? "selected" : ""}>${capitalize(type)}</option>`)
                .join("")}
            </select>
          </label>
        </div>
      </div>
      <section>
        <div id="home-grid" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          ${skeletonCards(12)}
        </div>
      </section>
    </section>
  `;

  const grid = app.root.querySelector("#home-grid");

  if (!app.pokemonList.length) {
    try {
      app.pokemonList = await fetchPokemonList();
      const allTypes = new Set(["all"]);
      app.pokemonList.forEach((pokemon) => pokemon.types.forEach((type) => allTypes.add(type)));
      app.availableTypes = [...allTypes];
      app.root.querySelector("#type-select").innerHTML = app.availableTypes
        .map((type) => `<option value="${type}" ${app.selectedType === type ? "selected" : ""}>${capitalize(type)}</option>`)
        .join("");
    } catch (error) {
      grid.innerHTML = `<p class="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 dark:bg-red-900/40 dark:text-red-100">${error.message}</p>`;
      return;
    }
  }

  const paintCards = () => {
    const filtered = getFiltered(app.pokemonList, app.searchQuery, app.selectedType);

    if (!filtered.length) {
      grid.innerHTML = "<p class='col-span-full rounded-2xl bg-slate-200/80 p-8 text-center text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200'>No hay Pokemon para ese criterio.</p>";
      return;
    }

    grid.innerHTML = filtered.map(pokemonCard).join("");

    grid.querySelectorAll("[data-pokemon-card]").forEach((cardEl) => {
      cardEl.addEventListener("click", () => {
        const pokemonId = cardEl.getAttribute("data-pokemon-card");
        window.location.hash = `#/pokemon/${pokemonId}`;
      });
    });
  };

  paintCards();

  const searchInput = app.root.querySelector("#search-input");
  const onSearch = debounce((event) => {
    app.searchQuery = event.target.value;
    paintCards();
  }, 200);

  searchInput.addEventListener("input", onSearch);

  const typeSelect = app.root.querySelector("#type-select");
  typeSelect.addEventListener("change", (event) => {
    app.selectedType = event.target.value;
    paintCards();
  });
}
