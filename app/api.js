import { API_BASE, POKEMON_LIMIT } from "./constants.js";
import { mapWithConcurrency, parseIdFromUrl } from "./utils.js";

const pokemonCache = new Map();
let pokemonListCache = null;

function normalizePokemon(data) {
  return {
    id: data.id,
    name: data.name,
    image:
      data.sprites.other["official-artwork"].front_default ||
      data.sprites.front_default,
    types: data.types.map((entry) => entry.type.name),
    stats: data.stats.map((entry) => ({
      name: entry.stat.name,
      value: entry.base_stat,
    })),
    abilities: data.abilities.map((entry) => entry.ability.name),
    baseExperience: data.base_experience || 0,
  };
}

export async function fetchPokemonByIdOrName(idOrName) {
  const key = String(idOrName).toLowerCase();
  if (pokemonCache.has(key)) return pokemonCache.get(key);

  const response = await fetch(`${API_BASE}/pokemon/${key}`);
  if (!response.ok) throw new Error("No fue posible cargar el Pokemon solicitado");

  const data = await response.json();
  const normalized = normalizePokemon(data);
  pokemonCache.set(key, normalized);
  pokemonCache.set(String(normalized.id), normalized);
  pokemonCache.set(normalized.name, normalized);
  return normalized;
}

export async function fetchPokemonList(limit = POKEMON_LIMIT) {
  if (pokemonListCache && pokemonListCache.length >= limit) {
    return pokemonListCache.slice(0, limit);
  }

  const response = await fetch(`${API_BASE}/pokemon?limit=${limit}`);
  if (!response.ok) throw new Error("No fue posible cargar la lista de Pokemon");

  const listData = await response.json();
  const normalizedList = await mapWithConcurrency(
    listData.results,
    async (entry) => {
      const id = parseIdFromUrl(entry.url);
      return fetchPokemonByIdOrName(id);
    },
    10,
  );

  pokemonListCache = normalizedList;
  return normalizedList;
}

export async function fetchRandomPokemon(excludeId = null) {
  let candidateId = Math.floor(Math.random() * POKEMON_LIMIT) + 1;
  while (excludeId && candidateId === excludeId) {
    candidateId = Math.floor(Math.random() * POKEMON_LIMIT) + 1;
  }
  return fetchPokemonByIdOrName(candidateId);
}
