import { fetchPokemonByIdOrName } from "../api.js";
import { getCapturedSet, removeCaptured } from "../storage.js";
import { typeBadge } from "../ui.js";
import { capitalize, formatNumber } from "../utils.js";

export async function renderMyPokedex(app) {
  const container = app.root.querySelector("#view-slot");
  container.innerHTML = `
    <section class="space-y-4 fade-in">
      <article class="glass rounded-2xl border border-white/60 p-4 shadow-sm dark:border-slate-700/60">
        <h1 class="text-2xl font-display text-emerald-500">Mi Pokedex</h1>
        <p class="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">Tu coleccion capturada se guarda en localStorage.</p>
      </article>
      <section id="captured-grid" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <article class="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/80">
          <div class="skeleton h-4 w-20 rounded"></div>
          <div class="skeleton mx-auto mt-4 h-24 w-24 rounded-full"></div>
          <div class="skeleton mx-auto mt-4 h-4 w-28 rounded"></div>
        </article>
      </section>
    </section>
  `;

  const grid = app.root.querySelector("#captured-grid");
  const capturedIds = [...getCapturedSet()].sort((a, b) => a - b);

  if (!capturedIds.length) {
    grid.innerHTML = "<p class='col-span-full rounded-2xl bg-slate-200/80 p-8 text-center text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200'>Aun no has capturado Pokemon.</p>";
    return;
  }

  const capturedPokemon = await Promise.all(capturedIds.map((id) => fetchPokemonByIdOrName(id)));

  const paint = () => {
    grid.innerHTML = capturedPokemon
      .map(
        (pokemon) => `
        <article class="poke-card rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/85">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">${formatNumber(pokemon.id)}</p>
            <button data-remove-id="${pokemon.id}" class="rounded-full bg-rose-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white transition hover:bg-rose-400">Eliminar</button>
          </div>
          <img loading="lazy" src="${pokemon.image}" alt="${pokemon.name}" class="mx-auto h-24 w-24 object-contain" />
          <h3 class="mt-3 text-center text-lg font-extrabold">${capitalize(pokemon.name)}</h3>
          <div class="mt-2 flex flex-wrap justify-center gap-2">${pokemon.types.map(typeBadge).join("")}</div>
        </article>
      `,
      )
      .join("");

    grid.querySelectorAll("[data-remove-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.getAttribute("data-remove-id"));
        removeCaptured(id);
        const idx = capturedPokemon.findIndex((pokemon) => pokemon.id === id);
        if (idx >= 0) capturedPokemon.splice(idx, 1);
        if (!capturedPokemon.length) {
          grid.innerHTML = "<p class='col-span-full rounded-2xl bg-slate-200/80 p-8 text-center text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200'>Tu Pokedex quedo vacia.</p>";
          return;
        }
        paint();
      });
    });
  };

  paint();
}
