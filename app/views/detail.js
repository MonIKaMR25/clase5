import { fetchPokemonByIdOrName } from "../api.js";
import { TYPE_COLORS } from "../constants.js";
import { getCapturedSet, toggleCaptured } from "../storage.js";
import { typeBadge } from "../ui.js";
import { capitalize, formatNumber } from "../utils.js";

function statLabel(name) {
  return name.replace("special-", "sp. ").replace("-", " ");
}

export async function renderDetail(app, idOrName) {
  const container = app.root.querySelector("#view-slot");
  container.innerHTML = `
    <section class="space-y-4">
      <a href="#/" class="inline-flex items-center rounded-full bg-slate-800 px-4 py-2 text-sm font-bold text-white transition hover:scale-105 dark:bg-slate-200 dark:text-slate-900">Volver</a>
      <article class="glass overflow-hidden rounded-3xl border border-white/60 p-5 shadow-lg dark:border-slate-700/60">
        <div class="grid gap-8 md:grid-cols-2">
          <div class="rounded-2xl bg-gradient-to-br from-cyan-200 via-sky-100 to-emerald-100 p-6 dark:from-cyan-900/50 dark:via-slate-900 dark:to-emerald-900/40">
            <div class="skeleton mx-auto h-72 w-72 max-w-full rounded-2xl"></div>
          </div>
          <div class="space-y-4">
            <div class="skeleton h-8 w-40 rounded"></div>
            <div class="skeleton h-4 w-20 rounded"></div>
            <div class="flex gap-2">
              <div class="skeleton h-7 w-16 rounded-full"></div>
              <div class="skeleton h-7 w-16 rounded-full"></div>
            </div>
            <div class="space-y-2">
              <div class="skeleton h-3 w-full rounded"></div>
              <div class="skeleton h-3 w-11/12 rounded"></div>
              <div class="skeleton h-3 w-10/12 rounded"></div>
            </div>
          </div>
        </div>
      </article>
    </section>
  `;

  try {
    const pokemon = await fetchPokemonByIdOrName(idOrName);
    const capturedSet = getCapturedSet();
    const isCaptured = capturedSet.has(pokemon.id);

    container.innerHTML = `
      <section class="space-y-4 fade-in">
        <a href="#/" class="inline-flex items-center rounded-full bg-slate-800 px-4 py-2 text-sm font-bold text-white transition hover:scale-105 dark:bg-slate-200 dark:text-slate-900">Volver</a>
        <article class="glass overflow-hidden rounded-3xl border border-white/60 p-5 shadow-lg dark:border-slate-700/60">
          <div class="grid gap-8 md:grid-cols-2">
            <div class="rounded-2xl bg-gradient-to-br from-cyan-200 via-sky-100 to-emerald-100 p-6 dark:from-cyan-900/50 dark:via-slate-900 dark:to-emerald-900/40">
              <img src="${pokemon.image}" alt="${pokemon.name}" class="mx-auto h-72 w-72 max-w-full object-contain drop-shadow-2xl" />
            </div>
            <div class="space-y-5">
              <div>
                <h1 class="text-3xl font-display leading-tight text-orange-500">${capitalize(pokemon.name)}</h1>
                <p class="mt-1 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">${formatNumber(pokemon.id)}</p>
              </div>
              <div class="flex flex-wrap gap-2">${pokemon.types.map(typeBadge).join("")}</div>
              <button id="capture-btn" class="capsule-btn rounded-full px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition ${isCaptured ? "bg-rose-500 hover:bg-rose-400" : "bg-emerald-500 hover:bg-emerald-400"}">
                ${isCaptured ? "Liberar" : "Capturar"}
              </button>
              <section class="space-y-3">
                <h2 class="text-lg font-extrabold">Stats</h2>
                ${pokemon.stats
                  .map((stat) => {
                    const percent = Math.min(100, Math.round((stat.value / 180) * 100));
                    const color = pokemon.types[0] ? TYPE_COLORS[pokemon.types[0]] : "#64748b";
                    return `
                    <div class="space-y-1">
                      <div class="flex justify-between text-xs font-bold uppercase tracking-wide">
                        <span>${statLabel(stat.name)}</span>
                        <span>${stat.value}</span>
                      </div>
                      <div class="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div class="health-bar h-full rounded-full" style="width:${percent}%; background:${color}"></div>
                      </div>
                    </div>
                  `;
                  })
                  .join("")}
              </section>
              <section class="space-y-2">
                <h2 class="text-lg font-extrabold">Habilidades</h2>
                <div class="flex flex-wrap gap-2">
                  ${pokemon.abilities
                    .map(
                      (ability) =>
                        `<span class="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-100">${ability.replace("-", " ")}</span>`,
                    )
                    .join("")}
                </div>
              </section>
            </div>
          </div>
        </article>
      </section>
    `;

    const captureBtn = app.root.querySelector("#capture-btn");
    captureBtn.addEventListener("click", () => {
      const updatedSet = toggleCaptured(pokemon.id);
      const nowCaptured = updatedSet.has(pokemon.id);
      captureBtn.className = `capsule-btn rounded-full px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition ${nowCaptured ? "bg-rose-500 hover:bg-rose-400" : "bg-emerald-500 hover:bg-emerald-400"}`;
      captureBtn.textContent = nowCaptured ? "Liberar" : "Capturar";
    });
  } catch (error) {
    container.innerHTML = `<p class="rounded-2xl bg-red-100 p-4 text-sm font-bold text-red-700 dark:bg-red-900/40 dark:text-red-100">${error.message}</p>`;
  }
}
