import { TYPE_COLORS } from "./constants.js";
import { capitalize, formatNumber } from "./utils.js";

export function typeBadge(typeName) {
  const bg = TYPE_COLORS[typeName] || "#64748b";
  return `<span class="rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white" style="background:${bg}">${typeName}</span>`;
}

export function pokemonCard(pokemon) {
  return `
    <article data-pokemon-card="${pokemon.id}" class="poke-card fade-in group cursor-pointer rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-sm transition-all dark:border-slate-700 dark:bg-slate-900/85">
      <div class="mb-3 flex items-start justify-between">
        <p class="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">${formatNumber(pokemon.id)}</p>
        <span class="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700 transition-transform group-hover:scale-105 dark:bg-amber-900/60 dark:text-amber-200">Ver detalle</span>
      </div>
      <img loading="lazy" src="${pokemon.image}" alt="${pokemon.name}" class="mx-auto h-28 w-28 animate-floaty object-contain" />
      <h3 class="mt-3 text-center text-lg font-extrabold">${capitalize(pokemon.name)}</h3>
      <div class="mt-3 flex flex-wrap justify-center gap-2">
        ${pokemon.types.map(typeBadge).join("")}
      </div>
    </article>
  `;
}

export function skeletonCards(count = 12) {
  return Array.from({ length: count })
    .map(
      () => `
        <article class="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
          <div class="skeleton h-4 w-20 rounded"></div>
          <div class="skeleton mx-auto mt-4 h-28 w-28 rounded-full"></div>
          <div class="skeleton mx-auto mt-4 h-4 w-32 rounded"></div>
          <div class="mt-3 flex justify-center gap-2">
            <div class="skeleton h-6 w-14 rounded-full"></div>
            <div class="skeleton h-6 w-16 rounded-full"></div>
          </div>
        </article>
      `,
    )
    .join("");
}

export function appShell({ activeRoute, content }) {
  const isHome = activeRoute === "home";
  const isBattle = activeRoute === "battle";
  const isDex = activeRoute === "dex";

  return `
    <div class="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-5 sm:px-6 lg:px-8">
      <header class="glass sticky top-3 z-10 mb-6 rounded-2xl border border-white/50 px-4 py-3 shadow-lg dark:border-slate-700/60">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <a href="#/" class="text-xl font-display tracking-wide text-orange-500 drop-shadow-sm sm:text-2xl">Poke Arena</a>
          <nav class="flex flex-wrap items-center gap-2 text-sm font-bold">
            <a href="#/" class="rounded-full px-3 py-2 transition ${isHome ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-700 hover:bg-orange-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}">Inicio</a>
            <a href="#/battle" class="rounded-full px-3 py-2 transition ${isBattle ? "bg-cyan-500 text-white" : "bg-slate-200 text-slate-700 hover:bg-cyan-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}">Batalla</a>
            <a href="#/my-pokedex" class="rounded-full px-3 py-2 transition ${isDex ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700 hover:bg-emerald-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}">Mi Pokedex</a>
            <button id="theme-toggle" class="rounded-full bg-slate-900 px-3 py-2 text-white transition hover:scale-105 dark:bg-white dark:text-slate-900">Tema</button>
          </nav>
        </div>
      </header>
      <main class="flex-1">${content}</main>
    </div>
  `;
}
