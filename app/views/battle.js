import { fetchPokemonByIdOrName, fetchRandomPokemon } from "../api.js";
import { TYPE_COLORS } from "../constants.js";
import { getCapturedSet } from "../storage.js";
import { capitalize, formatNumber, sleep } from "../utils.js";

let audioContext;

const DIFFICULTY_CONFIG = {
  casual: {
    label: "Casual",
    playerDamage: 1.15,
    rivalDamage: 0.85,
    turnDelay: 700,
  },
  normal: {
    label: "Normal",
    playerDamage: 1,
    rivalDamage: 1,
    turnDelay: 580,
  },
  hard: {
    label: "Hard",
    playerDamage: 0.9,
    rivalDamage: 1.2,
    turnDelay: 460,
  },
};

function getDifficultyDescription(mode) {
  const difficulty = DIFFICULTY_CONFIG[mode] || DIFFICULTY_CONFIG.normal;
  const playerPct = Math.round(difficulty.playerDamage * 100);
  const rivalPct = Math.round(difficulty.rivalDamage * 100);
  const speedLabel =
    difficulty.turnDelay >= 650
      ? "Ritmo: lento"
      : difficulty.turnDelay <= 500
        ? "Ritmo: rapido"
        : "Ritmo: equilibrado";

  return {
    title: `Modo ${difficulty.label}`,
    detail: `Danio jugador ${playerPct}% | Danio rival ${rivalPct}% | ${speedLabel}`,
  };
}

function playTone(freq, duration = 90) {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!audioContext) audioContext = new Ctx();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "square";
  oscillator.frequency.value = freq;
  gain.gain.value = 0.06;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration / 1000);
}

function getStat(pokemon, statName) {
  const found = pokemon.stats.find((entry) => entry.name === statName);
  return found ? found.value : 40;
}

function triggerHitAnimation(cardEl) {
  if (!cardEl) return;
  cardEl.classList.remove("hit");
  void cardEl.offsetWidth;
  cardEl.classList.add("hit");
}

function battleCard(pokemon, side) {
  const typeColor = TYPE_COLORS[pokemon.types[0]] || "#64748b";
  const sideId = side.toLowerCase();
  return `
    <article id="${sideId}-card" class="battle-card rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/85">
      <div class="mb-3 flex items-start justify-between">
        <h3 class="text-lg font-extrabold">${side}: ${capitalize(pokemon.name)}</h3>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500">${formatNumber(pokemon.id)}</span>
      </div>
      <img src="${pokemon.image}" alt="${pokemon.name}" class="mx-auto h-36 w-36 object-contain" />
      <div class="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div id="${sideId}-hp" class="health-bar h-full rounded-full" style="width:100%; background:${typeColor}"></div>
      </div>
      <p id="${sideId}-hp-text" class="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">HP 100%</p>
    </article>
  `;
}

export async function renderBattle(app) {
  const capturedIds = [...getCapturedSet()].sort((a, b) => a - b);

  const container = app.root.querySelector("#view-slot");
  container.innerHTML = `
    <section class="space-y-5 fade-in">
      <article class="glass rounded-2xl border border-white/60 p-4 shadow-sm dark:border-slate-700/60">
        <h1 class="text-2xl font-display text-cyan-500">Modo Batalla</h1>
        <p class="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">Elige uno de tus Pokemon capturados, genera un rival aleatorio y ejecuta una simulacion por turnos.</p>
        <div class="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <label class="space-y-1">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tu Pokemon</span>
            <select id="battle-player" ${capturedIds.length ? "" : "disabled"} class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none ring-cyan-400 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900">
              ${capturedIds.length ? '<option value="">Cargando capturados...</option>' : '<option value="">Sin capturados</option>'}
            </select>
          </label>
          <label class="space-y-1">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Dificultad</span>
            <select id="battle-difficulty" ${capturedIds.length ? "" : "disabled"} class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none ring-fuchsia-400 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900">
              <option value="casual">Casual</option>
              <option value="normal" selected>Normal</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <button id="random-rival-btn" ${capturedIds.length ? "" : "disabled"} class="rounded-xl bg-fuchsia-500 px-4 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-60">Rival aleatorio</button>
          <button id="start-battle-btn" ${capturedIds.length ? "" : "disabled"} class="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">Iniciar</button>
        </div>
        <article id="difficulty-rules" class="mt-3 rounded-xl border border-fuchsia-200 bg-fuchsia-50/80 p-3 dark:border-fuchsia-800/60 dark:bg-fuchsia-900/20">
          <p id="difficulty-title" class="text-xs font-extrabold uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-200">Modo Normal</p>
          <p id="difficulty-detail" class="mt-1 text-xs font-bold text-fuchsia-800 dark:text-fuchsia-100">Danio jugador 100% | Danio rival 100% | Ritmo: equilibrado</p>
        </article>
        ${capturedIds.length
          ? ""
          : '<p class="mt-3 rounded-xl bg-amber-100 px-3 py-2 text-xs font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-900/40 dark:text-amber-100">Necesitas capturar al menos 1 Pokemon en el detalle para poder combatir.</p><a href="#/" class="mt-2 inline-flex rounded-full bg-emerald-500 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-emerald-400">Ir a capturar</a>'}
      </article>
      <section id="battle-stage" class="grid gap-4 md:grid-cols-2">
        <article class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm font-bold text-slate-500 dark:border-slate-700 dark:text-slate-400">Jugador pendiente...</article>
        <article class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm font-bold text-slate-500 dark:border-slate-700 dark:text-slate-400">Rival pendiente...</article>
      </section>
      <div id="round-counter" class="inline-flex w-fit items-center rounded-full bg-amber-100 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:bg-amber-900/40 dark:text-amber-100">Ronda: 0</div>
      <div id="battle-log" class="rounded-2xl bg-slate-900 p-4 text-sm font-bold text-lime-300 shadow-inner">Listo para combatir.</div>
    </section>
  `;

  let rival = null;

  const playerSelect = app.root.querySelector("#battle-player");
  const stage = app.root.querySelector("#battle-stage");
  const log = app.root.querySelector("#battle-log");
  const roundCounter = app.root.querySelector("#round-counter");
  const difficultySelect = app.root.querySelector("#battle-difficulty");
  const difficultyTitle = app.root.querySelector("#difficulty-title");
  const difficultyDetail = app.root.querySelector("#difficulty-detail");
  const randomRivalBtn = app.root.querySelector("#random-rival-btn");
  const startBattleBtn = app.root.querySelector("#start-battle-btn");

  const paintDifficultyRules = () => {
    const description = getDifficultyDescription(difficultySelect?.value || "normal");
    difficultyTitle.textContent = description.title;
    difficultyDetail.textContent = description.detail;
  };

  paintDifficultyRules();

  if (!capturedIds.length) {
    log.textContent = "Aun no hay Pokemon capturados para batalla.";
    return;
  }

  difficultySelect.addEventListener("change", paintDifficultyRules);

  const capturedPokemon = await Promise.all(capturedIds.map((id) => fetchPokemonByIdOrName(id)));
  playerSelect.innerHTML = capturedPokemon
    .map(
      (pokemon) =>
        `<option value="${pokemon.id}">${formatNumber(pokemon.id)} - ${capitalize(pokemon.name)}</option>`,
    )
    .join("");

  randomRivalBtn.addEventListener("click", async () => {
    randomRivalBtn.disabled = true;
    randomRivalBtn.textContent = "Cargando...";
    const playerId = Number(playerSelect.value);
    try {
      rival = await fetchRandomPokemon(playerId);
      log.textContent = `Rival listo: ${capitalize(rival.name)}.`;
      playTone(620, 120);
    } catch (error) {
      log.textContent = error.message;
    } finally {
      randomRivalBtn.disabled = false;
      randomRivalBtn.textContent = "Rival aleatorio";
    }
  });

  startBattleBtn.addEventListener("click", async () => {
    startBattleBtn.disabled = true;
    startBattleBtn.textContent = "Combatiendo...";

    try {
      const difficulty = DIFFICULTY_CONFIG[difficultySelect.value] || DIFFICULTY_CONFIG.normal;
      const player = await fetchPokemonByIdOrName(Number(playerSelect.value));
      if (!rival) {
        rival = await fetchRandomPokemon(player.id);
      }

      stage.innerHTML = `${battleCard(player, "Jugador")} ${battleCard(rival, "Rival")}`;

      const playerHpEl = app.root.querySelector("#jugador-hp");
      const rivalHpEl = app.root.querySelector("#rival-hp");
      const playerHpText = app.root.querySelector("#jugador-hp-text");
      const rivalHpText = app.root.querySelector("#rival-hp-text");
      const playerCard = app.root.querySelector("#jugador-card");
      const rivalCard = app.root.querySelector("#rival-card");

      let playerHp = getStat(player, "hp") + 60;
      let rivalHp = getStat(rival, "hp") + 60;
      const playerAtk = getStat(player, "attack");
      const rivalAtk = getStat(rival, "attack");
      let round = 1;

      const maxPlayerHp = playerHp;
      const maxRivalHp = rivalHp;

      log.textContent = `Empieza el combate en dificultad ${difficulty.label}...`;
      roundCounter.textContent = "Ronda: 1";
      await sleep(500);

      while (playerHp > 0 && rivalHp > 0) {
        const playerDamage = Math.max(
          6,
          Math.round(playerAtk * (0.3 + Math.random() * 0.4) * difficulty.playerDamage),
        );
        rivalHp = Math.max(0, rivalHp - playerDamage);
        triggerHitAnimation(rivalCard);
        rivalHpEl.style.width = `${Math.round((rivalHp / maxRivalHp) * 100)}%`;
        rivalHpText.textContent = `HP ${Math.round((rivalHp / maxRivalHp) * 100)}%`;
        log.textContent = `Ronda ${round}: ${capitalize(player.name)} golpea por ${playerDamage}.`;
        playTone(440, 80);
        await sleep(difficulty.turnDelay);

        if (rivalHp <= 0) break;

        const rivalDamage = Math.max(
          6,
          Math.round(rivalAtk * (0.3 + Math.random() * 0.4) * difficulty.rivalDamage),
        );
        playerHp = Math.max(0, playerHp - rivalDamage);
        triggerHitAnimation(playerCard);
        playerHpEl.style.width = `${Math.round((playerHp / maxPlayerHp) * 100)}%`;
        playerHpText.textContent = `HP ${Math.round((playerHp / maxPlayerHp) * 100)}%`;
        log.textContent = `${capitalize(rival.name)} contraataca por ${rivalDamage}.`;
        playTone(280, 90);
        await sleep(difficulty.turnDelay);

        round += 1;
        roundCounter.textContent = `Ronda: ${round}`;
      }

      const winner = playerHp > 0 ? player : rival;
      log.textContent = `Ganador: ${capitalize(winner.name)}.`;
      playTone(760, 190);
      await sleep(120);
      playTone(880, 220);
    } catch (error) {
      log.textContent = error.message;
    } finally {
      startBattleBtn.disabled = false;
      startBattleBtn.textContent = "Iniciar";
    }
  });
}
